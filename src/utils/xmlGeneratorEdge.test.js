import { codeToXML } from './xmlGenerator';
import { parseArduinoCode } from './codeParser';

const sketch = (setup = '', loop = '') => `void setup() {\n${setup}\n}\nvoid loop() {\n${loop}\n}`;
const xml = (code) => codeToXML(code) ?? '';

describe('codeToXML — llamadas con argumentos ausentes', () => {
  test('analogRead sin argumento usa A0', () => {
    expect(xml(sketch('', '  int v = analogRead();')))
      .toContain('<field name="PIN">A0</field>');
  });

  test('digitalRead sin argumento usa el pin 2', () => {
    const salida = xml(sketch('', '  int v = digitalRead();'));
    expect(salida).toContain('type="arduino_digital_read"');
    expect(salida).toContain('<field name="NUM">2</field>');
  });

  test('digitalWrite sin estado usa HIGH', () => {
    expect(xml(sketch('', '  digitalWrite(13);'))).toContain('<field name="STATE">HIGH</field>');
  });

  test('pinMode sin argumentos usa el pin 13 y OUTPUT', () => {
    const salida = xml(sketch('  pinMode();'));
    expect(salida).toContain('<field name="NUM">13</field>');
    expect(salida).toContain('<field name="MODE">OUTPUT</field>');
  });

  test('tone y noTone sin argumentos usan el pin 8', () => {
    expect(xml(sketch('', '  tone();'))).toContain('type="arduino_tone"');
    expect(xml(sketch('', '  noTone();'))).toContain('<field name="NUM">8</field>');
  });

  test('shiftOut sin argumentos usa los pines por defecto', () => {
    const salida = xml(sketch('', '  shiftOut();'));
    expect(salida).toContain('type="arduino_shift_out"');
    expect(salida).toContain('<field name="ORDER">MSBFIRST</field>');
  });

  test('pulseIn con LOW conserva el estado', () => {
    expect(xml(sketch('', '  long d = pulseIn(7, LOW);'))).toContain('<field name="STATE">LOW</field>');
  });

  test('Serial.available y Serial.read como expresiones', () => {
    expect(xml(sketch('', '  if (Serial.available() > 0) { int c = Serial.read(); }')))
      .toContain('type="arduino_serial_available"');
    expect(xml(sketch('', '  int c = Serial.read();'))).toContain('type="arduino_serial_read"');
  });

  test('Serial.begin sin argumento usa 9600', () => {
    expect(xml(sketch('  Serial.begin();'))).toContain('<field name="BAUD">9600</field>');
  });
});

describe('codeToXML — expresiones poco habituales', () => {
  test('el literal false se convierte en logic_boolean FALSE', () => {
    expect(xml(sketch('', '  bool activo = false;'))).toContain('<field name="BOOL">FALSE</field>');
  });

  test('el operador OR lógico se conserva', () => {
    expect(xml(sketch('', '  if (a || b) { delay(1); }'))).toContain('<field name="OP">||</field>');
  });

  test('un array global sin tamaño ni elementos usa 10', () => {
    expect(xml('int datos[];\n' + sketch('  delay(1);'))).toContain('<field name="SIZE">10</field>');
  });

  test('un #define sin valor genera el bloque igualmente', () => {
    expect(xml('#define DEBUG\n' + sketch('  delay(1);'))).toContain('type="arduino_define"');
  });

  test('una función sin cuerpo ni parámetros se convierte igual', () => {
    expect(xml('void nada() {\n}\n' + sketch('  delay(1);'))).toContain('type="arduino_function_define"');
  });
});

describe('codeParser — ramas defensivas', () => {
  const parse = parseArduinoCode;

  test('un hexadecimal incompleto vale 0', () => {
    const ast = parse(sketch('', '  x = 0x;'));
    expect(ast.loop[0].expr.value.value).toBe(0);
  });

  test('un miembro sin nombre no rompe el análisis', () => {
    expect(parse(sketch('', '  a.;')).error).toBeNull();
  });

  test('do sin while se tolera', () => {
    const ast = parse(sketch('', '  do { delay(1); } (x);'));
    expect(ast.error).toBeNull();
  });

  test('array local sin tamaño con inicialización', () => {
    const ast = parse(sketch('  int datos[] = {1, 2};'));
    expect(ast.setup[0].type).toBe('arraydecl');
    expect(ast.setup[0].size).toBeNull();
  });

  test('array local sin llave de inicialización', () => {
    const ast = parse(sketch('  int datos[2] = otro;'));
    expect(ast.setup[0].type).toBe('arraydecl');
  });

  test('declaración sin nombre no genera un nodo de variable', () => {
    const ast = parse(sketch('  int = 5;'));
    expect(ast.setup.some((s2) => s2.type === 'vardecl')).toBe(false);
  });

  test('una rama de if sin sentencia válida queda vacía', () => {
    const ast = parse(sketch('', '  if (a) ;'));
    expect(ast.loop[0].then).toEqual([]);
  });

  test('switch con case vacío y llaves internas', () => {
    const ast = parse(sketch('', '  switch (x) {\n    case 1: { delay(1); }\n    break;\n  }'));
    expect(ast.loop[0].cases.length).toBeGreaterThan(0);
  });

  test('parámetros de función con paréntesis anidados', () => {
    const ast = parse('void f(int (*cb)(int)) {\n  delay(1);\n}\n' + sketch('  delay(1);'));
    expect(ast.functions[0].name).toBe('f');
  });

  test('una sentencia sin expresión no genera nodo', () => {
    const ast = parse(sketch('  ;'));
    expect(ast.setup).toEqual([]);
  });
});
