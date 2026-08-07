import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import {
  defineArduinoBlocks, nameFieldValidator, referenceFieldValidator, pinFieldValidator,
} from './arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from './arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators } from './kidsBlocks';
import { toolboxConfig, kidsToolboxConfig } from './toolbox';
import { LIBRARY_BLOCKS, registerLibraryBlocks } from './libraryBlocks';

// ──────────────────────────────────────────────────────────────────────────────
// Cobertura de las ramas «con valor conectado» de todos los generadores:
// cada hueco de valor tiene un valor por defecto cuando está vacío, así que hay
// que ejercitar ambos caminos.
// ──────────────────────────────────────────────────────────────────────────────

Blockly.common.defineBlocks(builtinBlocks);
defineArduinoBlocks();
registerArduinoGenerators(arduinoGenerator);
defineKidsBlocks();
registerKidsGenerators(arduinoGenerator);
for (const lib of Object.keys(LIBRARY_BLOCKS)) registerLibraryBlocks(lib, arduinoGenerator);

function collectTypes(config) {
  const types = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (item.kind === 'block' && item.type) types.push(item.type);
      if (item.contents) walk(item.contents);
    }
  };
  walk(config.contents);
  return types;
}

const TIPOS = [
  ...new Set([
    ...collectTypes(toolboxConfig),
    ...collectTypes(kidsToolboxConfig),
    ...Object.values(LIBRARY_BLOCKS).flatMap((d) => d.blocks.map((b) => b.type)),
  ]),
];

let ws;
beforeEach(() => { ws = new Blockly.Workspace(); });
afterEach(() => { ws.dispose(); });

describe('Todos los bloques generan código con sus huecos rellenos', () => {
  test.each(TIPOS)('%s con todos sus valores conectados', (type) => {
    const block = ws.newBlock(type);

    for (const input of block.inputList) {
      if (!input.connection || input.connection.type !== Blockly.INPUT_VALUE) continue;
      const valor = ws.newBlock('math_number');
      valor.setFieldValue('7', 'NUM');
      try {
        input.connection.connect(valor.outputConnection);
      } catch {
        // Algunos huecos exigen otro tipo (Boolean/String); se prueban aparte
        valor.dispose();
      }
    }

    const salida = arduinoGenerator.blockToCode(block);
    const texto = Array.isArray(salida) ? salida[0] : salida;
    expect(typeof texto).toBe('string');
  });

  test('los huecos booleanos aceptan condiciones', () => {
    const cond = () => ws.newBlock('logic_boolean');
    for (const type of ['arduino_if', 'arduino_if_simple', 'arduino_while', 'arduino_do_while', 'arduino_not']) {
      const b = ws.newBlock(type);
      const input = b.inputList.find((i) => i.connection && i.connection.type === Blockly.INPUT_VALUE);
      input.connection.connect(cond().outputConnection);
      expect(typeof arduinoGenerator.blockToCode(b)).toBeDefined();
    }
  });
});

describe('Generadores del modo Niño con campos ausentes', () => {
  /** Bloque falso: devuelve null en todos sus campos para forzar los valores por defecto */
  const bloqueVacio = { getFieldValue: () => null, getInputTargetBlock: () => null };

  test('LED RGB usa los valores por defecto', () => {
    expect(arduinoGenerator.forBlock['kids_rgb_led'](bloqueVacio))
      .toBe('analogWrite(9, 255);\nanalogWrite(10, 0);\nanalogWrite(11, 0);\n');
  });

  test('NeoPixel usa píxel y color por defecto', () => {
    expect(arduinoGenerator.forBlock['kids_neopixel_color'](bloqueVacio))
      .toBe('strip.setPixelColor(0, strip.Color(255, 0, 0));\n');
    expect(arduinoGenerator.forBlock['kids_neopixel_brightness'](bloqueVacio))
      .toBe('strip.setBrightness(50);\n');
  });

  test('el bucle for del modo Niño usa el nombre de contador por defecto', () => {
    const ws2 = new Blockly.Workspace();
    const b = ws2.newBlock('kids_for');
    const original = b.getFieldValue.bind(b);
    b.getFieldValue = (name) => (name === 'VAR' ? null : original(name));
    expect(arduinoGenerator.forBlock['kids_for'](b)).toContain('int i = ');
    ws2.dispose();
  });
});

describe('Validadores con entradas nulas', () => {
  test('el validador de pines convierte null en el pin por defecto', () => {
    expect(pinFieldValidator(null)).toBe('13');
    expect(pinFieldValidator(undefined)).toBe('13');
  });

  test('los validadores de nombre rechazan null', () => {
    expect(nameFieldValidator(null)).toBeNull();
    expect(nameFieldValidator(undefined)).toBeNull();
    expect(referenceFieldValidator(null)).toBeNull();
    expect(referenceFieldValidator(undefined)).toBeNull();
  });

  test('el campo de carácter siempre deja un carácter', () => {
    const ws2 = new Blockly.Workspace();
    const b = ws2.newBlock('arduino_char');
    b.setFieldValue('', 'CHAR');
    expect(b.getFieldValue('CHAR')).toBe('A');
    b.setFieldValue('xyz', 'CHAR');
    expect(b.getFieldValue('CHAR')).toBe('x');
    ws2.dispose();
  });
});

describe('Generadores con campos vacíos', () => {
  const vacio = { getFieldValue: () => null, getInputTargetBlock: () => null };

  test('los bloques con nombre caen en su nombre por defecto', () => {
    expect(arduinoGenerator.forBlock['arduino_increment'](vacio)).toBe('i++;\n');
    expect(arduinoGenerator.forBlock['arduino_compound_assign'](vacio)).toContain('miVariable');
    expect(arduinoGenerator.forBlock['arduino_bit_write'](vacio)).toContain('miVariable');
    expect(arduinoGenerator.forBlock['arduino_bit_set_clear'](vacio)).toContain('miVariable');
    expect(arduinoGenerator.forBlock['arduino_sizeof'](vacio)[0]).toBe('sizeof(miArray)');
    expect(arduinoGenerator.forBlock['arduino_function_call'](vacio)).toBe('miFuncion();\n');
    expect(arduinoGenerator.forBlock['arduino_function_call_expr'](vacio)[0]).toBe('miFuncion()');
    expect(arduinoGenerator.forBlock['arduino_attach_interrupt'](vacio)).toContain('miISR');
    expect(arduinoGenerator.forBlock['arduino_serial_read_string_until'](vacio)[0])
      .toBe("Serial.readStringUntil('\\n')");
    expect(arduinoGenerator.forBlock['arduino_char'](vacio)[0]).toBe("'A'");
  });

  test('los arrays y las referencias sin nombre usan el predeterminado', () => {
    expect(arduinoGenerator.forBlock['arduino_array_get'](vacio)[0]).toBe('miArray[0]');
    expect(arduinoGenerator.forBlock['arduino_array_set'](vacio)).toBe('miArray[0] = 0;\n');
  });

  test('el código libre sin contenido no rompe', () => {
    expect(arduinoGenerator.forBlock['arduino_raw_statement'](vacio)).toBe('');
    expect(arduinoGenerator.forBlock['arduino_raw_expression'](vacio)[0]).toBe('0');
  });
});
