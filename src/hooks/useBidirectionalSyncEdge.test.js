import { renderHook, act } from '@testing-library/react';
import { useBidirectionalSync } from './useBidirectionalSync';

/** Ref falsa al editor de bloques */
const refEditor = () => ({ current: { loadXML: jest.fn() } });

const SKETCH_VALIDO = 'void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n}';

jest.useFakeTimers();

describe('useBidirectionalSync — protección contra ciclos', () => {
  test('ignora los cambios del editor mientras se propaga el código de los bloques', () => {
    const setCode = jest.fn();
    const ref = refEditor();
    const { result } = renderHook(() => useBidirectionalSync(ref, setCode));

    act(() => result.current.handleBlockCodeChange('desde bloques'));
    expect(setCode).toHaveBeenCalledWith('desde bloques');

    // Antes de que se libere el flag, el editor no debe poder sobrescribir
    setCode.mockClear();
    act(() => result.current.handleCodeEditorChange('desde editor'));
    expect(setCode).not.toHaveBeenCalled();

    act(() => { jest.advanceTimersByTime(1); });
    act(() => result.current.handleCodeEditorChange('ahora sí'));
    expect(setCode).toHaveBeenCalledWith('ahora sí');
  });

  test('ignora el código de los bloques mientras el usuario edita a mano', () => {
    const setCode = jest.fn();
    const { result } = renderHook(() => useBidirectionalSync(refEditor(), setCode));

    act(() => result.current.handleCodeEditorChange('int x = 1;'));
    setCode.mockClear();
    act(() => result.current.handleBlockCodeChange('void setup() {}'));
    expect(setCode).not.toHaveBeenCalled();
  });

  test('el análisis diferido carga los bloques cuando el código es válido', () => {
    const ref = refEditor();
    const { result } = renderHook(() => useBidirectionalSync(ref, jest.fn()));

    act(() => result.current.handleCodeEditorChange(SKETCH_VALIDO));
    expect(result.current.syncStatus).toBe('syncing');
    act(() => { jest.advanceTimersByTime(800); });
    expect(ref.current.loadXML).toHaveBeenCalled();
    expect(result.current.syncStatus).toBe('ok');
  });

  test('el código incompleto deja el estado en error', () => {
    const { result } = renderHook(() => useBidirectionalSync(refEditor(), jest.fn()));
    act(() => result.current.handleCodeEditorChange('int x ='));
    act(() => { jest.advanceTimersByTime(800); });
    expect(result.current.syncStatus).toBe('error');
  });

  test('vaciar el editor vuelve al estado correcto', () => {
    const { result } = renderHook(() => useBidirectionalSync(refEditor(), jest.fn()));
    act(() => result.current.handleCodeEditorChange('   '));
    act(() => { jest.advanceTimersByTime(800); });
    expect(result.current.syncStatus).toBe('ok');
  });

  test('el análisis diferido se cancela si vuelve a cambiar el código', () => {
    const ref = refEditor();
    const { result } = renderHook(() => useBidirectionalSync(ref, jest.fn()));
    act(() => result.current.handleCodeEditorChange(SKETCH_VALIDO));
    act(() => result.current.parseAndUpdateBlocks.cancel());
    act(() => { jest.advanceTimersByTime(800); });
    expect(ref.current.loadXML).not.toHaveBeenCalled();
  });

  test('un fallo del analizador deja el estado en error', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const ref = { current: { loadXML: () => { throw new Error('fallo al cargar'); } } };
    const { result } = renderHook(() => useBidirectionalSync(ref, jest.fn()));
    act(() => result.current.handleCodeEditorChange(SKETCH_VALIDO));
    act(() => { jest.advanceTimersByTime(800); });
    expect(result.current.syncStatus).toBe('error');
    warn.mockRestore();
  });
});
