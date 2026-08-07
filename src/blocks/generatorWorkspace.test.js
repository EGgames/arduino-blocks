import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import { defineArduinoBlocks } from './arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from './arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators } from './kidsBlocks';
import { registerLibraryBlocks } from './libraryBlocks';

// ──────────────────────────────────────────────────────────────────────────────
// Generación de sketch completo (workspaceToCode) desde un workspace headless
// ──────────────────────────────────────────────────────────────────────────────

Blockly.common.defineBlocks(builtinBlocks);
defineArduinoBlocks();
registerArduinoGenerators(arduinoGenerator);
defineKidsBlocks();
registerKidsGenerators(arduinoGenerator);
registerLibraryBlocks('Servo', arduinoGenerator);
registerLibraryBlocks('DHT', arduinoGenerator);

let ws;
beforeEach(() => { ws = new Blockly.Workspace(); });
afterEach(() => { ws.dispose(); });

/** Crea un bloque y le asigna campos */
function add(type, fields = {}) {
  const block = ws.newBlock(type);
  for (const [k, v] of Object.entries(fields)) block.setFieldValue(String(v), k);
  return block;
}

/** Conecta un bloque de valor a un input */
function plug(parent, inputName, child) {
  parent.getInput(inputName).connection.connect(child.outputConnection);
  return parent;
}

/** Conecta un bloque de sentencia dentro de un input de sentencias */
function nest(parent, inputName, child) {
  parent.getInput(inputName).connection.connect(child.previousConnection);
  return parent;
}

const gen = () => arduinoGenerator.workspaceToCode(ws);

describe('workspaceToCode — estructura del sketch', () => {
  test('sin bloques devuelve un aviso', () => {
    expect(gen()).toBe('// Agrega el bloque "Setup/Loop" para comenzar\n');
  });

  test('setup/loop vacíos generan el esqueleto con comentarios', () => {
    add('arduino_setup_loop');
    const code = gen();
    expect(code).toContain('void setup() {\n  // setup vacío\n}');
    expect(code).toContain('void loop() {\n  // loop vacío\n}');
  });

  test('encadena varias sentencias dentro de setup', () => {
    const sl = add('arduino_setup_loop');
    const begin = add('arduino_serial_begin', { BAUD: '115200' });
    const pinMode = add('arduino_pin_mode', { MODE: 'OUTPUT' });
    begin.nextConnection.connect(pinMode.previousConnection);
    nest(sl, 'SETUP', begin);
    const code = gen();
    expect(code).toContain('  Serial.begin(115200);\n  pinMode(13, OUTPUT);');
  });

  test('#define e #include flotantes van al principio', () => {
    add('arduino_setup_loop');
    add('arduino_define', { NAME: 'LED_PIN', VALUE: '13' });
    add('arduino_define', { NAME: 'DEBUG', VALUE: '' });
    add('arduino_include', { LIB: 'Servo' });
    const code = gen();
    expect(code.indexOf('#define LED_PIN 13')).toBeLessThan(code.indexOf('#include <Servo.h>'));
    expect(code).toContain('#define DEBUG\n');
  });

  test('struct y enum se declaran antes de las variables globales', () => {
    add('arduino_setup_loop');
    add('arduino_struct_define', { NAME: 'Punto', FIELDS: 'int x; int y;' });
    add('arduino_enum_define', { NAME: 'Color', VALUES: 'ROJO, VERDE' });
    const global = add('arduino_global_variable_declare', { TYPE: 'int', NAME: 'contador' });
    plug(global, 'VALUE', add('math_number', { NUM: 5 }));
    const code = gen();
    expect(code).toContain('struct Punto { int x; int y; };');
    expect(code).toContain('enum Color { ROJO, VERDE };');
    expect(code.indexOf('struct Punto')).toBeLessThan(code.indexOf('int contador = 5;'));
  });

  test('las variables globales admiten static y volatile', () => {
    add('arduino_setup_loop');
    const g = add('arduino_global_variable_declare', { STORAGE: 'volatile', TYPE: 'long', NAME: 'pulsos' });
    plug(g, 'VALUE', add('math_number', { NUM: 0 }));
    expect(gen()).toContain('volatile long pulsos = 0;');
  });

  test('constantes y arrays globales', () => {
    add('arduino_setup_loop');
    const c = add('arduino_const_define', { TYPE: 'float', NAME: 'PI2' });
    plug(c, 'VALUE', add('math_number', { NUM: 6.28 }));
    add('arduino_array_declare', { TYPE: 'int', NAME: 'datos', SIZE: 4 });
    add('arduino_array_declare_init', { TYPE: 'int', NAME: 'notas', ITEMS: '262, 294' });
    const code = gen();
    expect(code).toContain('const float PI2 = 6.28;');
    expect(code).toContain('int datos[4];');
    expect(code).toContain('int notas[] = {262, 294};');
  });

  test('las declaraciones dentro de una función son locales', () => {
    const sl = add('arduino_setup_loop');
    const c = add('arduino_const_define', { TYPE: 'int', NAME: 'LOCAL' });
    plug(c, 'VALUE', add('math_number', { NUM: 1 }));
    nest(sl, 'SETUP', c);
    const code = gen();
    expect(code).toContain('  const int LOCAL = 1;');
  });

  test('array declarado dentro de una función es local', () => {
    const sl = add('arduino_setup_loop');
    const a = add('arduino_array_declare', { TYPE: 'byte', NAME: 'buffer', SIZE: 8 });
    nest(sl, 'SETUP', a);
    expect(gen()).toContain('  byte buffer[8];');
  });

  test('array con valores dentro de una función es local', () => {
    const sl = add('arduino_setup_loop');
    const a = add('arduino_array_declare_init', { TYPE: 'int', NAME: 'seq', ITEMS: '1, 2' });
    nest(sl, 'SETUP', a);
    expect(gen()).toContain('  int seq[] = {1, 2};');
  });

  test('las funciones personalizadas aparecen antes de setup', () => {
    add('arduino_setup_loop');
    const fn = add('arduino_function_define', { RETURN_TYPE: 'int', NAME: 'doble', PARAMS: 'int x' });
    const ret = add('arduino_return');
    plug(ret, 'VALUE', add('math_number', { NUM: 2 }));
    nest(fn, 'BODY', ret);
    const code = gen();
    expect(code).toContain('int doble(int x) {\n  return 2;\n}');
    expect(code.indexOf('int doble')).toBeLessThan(code.indexOf('void setup()'));
  });

  test('solo con una función y sin setup/loop también genera sketch', () => {
    add('arduino_function_define', { RETURN_TYPE: 'void', NAME: 'saludar' });
    const code = gen();
    expect(code).toContain('void saludar() {');
    expect(code).toContain('void setup() {');
  });

  test('las declaraciones globales de librería se emiten una vez', () => {
    add('arduino_setup_loop');
    add('lib_servo_init');
    const dht = add('lib_dht_init', { PIN: 4, TYPE: 'DHT22' });
    expect(dht).toBeTruthy();
    const code = gen();
    expect(code).toContain('Servo myServo;');
    expect(code).toContain('DHT dht(4, DHT22);');
  });

  test('los bloques de librería anidados no se duplican como globales', () => {
    const sl = add('arduino_setup_loop');
    const attach = add('lib_servo_attach', { PIN: 9 });
    nest(sl, 'SETUP', attach);
    const code = gen();
    expect(code).toContain('  myServo.attach(9);');
    expect(code).not.toContain('Servo myServo;');
  });
});

describe('workspaceToCode — modo Niño', () => {
  test('genera setup/loop con bloques kids', () => {
    const sl = add('kids_setup_loop');
    const pin = add('kids_pin_mode', { PIN: '13', MODE: 'OUTPUT' });
    const write = add('kids_digital_write', { PIN: '13', VALUE: 'HIGH' });
    pin.nextConnection.connect(write.previousConnection);
    nest(sl, 'SETUP', pin);
    const code = gen();
    expect(code).toContain('pinMode(13, OUTPUT);');
    expect(code).toContain('digitalWrite(13, HIGH);');
  });

  test('los bloques NeoPixel añaden el include y el objeto global', () => {
    const sl = add('kids_setup_loop');
    const np = add('kids_neopixel_setup', { PIN: 6, NUM: 12 });
    nest(sl, 'SETUP', np);
    const code = gen();
    expect(code).toContain('#include <Adafruit_NeoPixel.h>');
    expect(code).toContain('Adafruit_NeoPixel strip(12, 6, NEO_GRB + NEO_KHZ800);');
    expect(code).toContain('strip.begin();');
  });

  test('no duplica el include de NeoPixel si ya existe', () => {
    const sl = add('kids_setup_loop');
    add('kids_include', { LIB: 'Adafruit_NeoPixel' });
    nest(sl, 'SETUP', add('kids_neopixel_setup'));
    const code = gen();
    expect(code.match(/#include <Adafruit_NeoPixel\.h>/g)).toHaveLength(1);
  });

  test('kids: variables globales, constantes y arrays', () => {
    add('kids_setup_loop');
    const g = add('kids_global_var', { TYPE: 'int', NAME: 'puntos' });
    plug(g, 'VALUE', add('math_number', { NUM: 3 }));
    add('kids_array_declare', { TYPE: 'int', NAME: 'lista', SIZE: 2 });
    const code = gen();
    expect(code).toContain('int puntos = 3;');
    expect(code).toContain('int lista[2];');
  });

  test('kids: bucle for y sonido usan campos numéricos', () => {
    const sl = add('kids_setup_loop');
    const f = add('kids_for', { VAR: 'i', FROM: 0, TO: 3, STEP: 1 });
    const tone = add('kids_tone', { PIN: 8 });
    nest(f, 'DO', tone);
    nest(sl, 'LOOP', f);
    const code = gen();
    expect(code).toContain('for (int i = 0; i <= 3; i += 1) {');
    expect(code).toContain('tone(8, 440);');
  });

  test('kids: for con paso negativo', () => {
    const sl = add('kids_setup_loop');
    nest(sl, 'LOOP', add('kids_for', { VAR: 'i', FROM: 5, TO: 0, STEP: -1 }));
    expect(gen()).toContain('i >= 0; i += -1');
  });

  test('kids: lectura analógica y RGB', () => {
    const sl = add('kids_setup_loop');
    const rgb = add('kids_rgb_led');
    nest(sl, 'LOOP', rgb);
    const read = add('kids_analog_read', { PIN: 2 });
    expect(arduinoGenerator.blockToCode(read)[0]).toBe('analogRead(A2)');
    expect(gen()).toContain('analogWrite(');
  });

  test('kids: función propia y serial', () => {
    add('kids_setup_loop');
    const fn = add('kids_function_define', { NAME: 'parpadear' });
    const serial = add('kids_serial_begin');
    nest(fn, 'BODY', serial);
    expect(gen()).toContain('Serial.begin(9600);');
  });
});

describe('Sketch completo de ejemplo', () => {
  test('blink con variable global como pin compila a C++ coherente', () => {
    const sl = add('arduino_setup_loop');

    const globalPin = add('arduino_global_variable_declare', { TYPE: 'int', NAME: 'ledPin' });
    plug(globalPin, 'VALUE', add('math_number', { NUM: 13 }));

    const pinMode = add('arduino_pin_mode', { MODE: 'OUTPUT' });
    plug(pinMode, 'PIN', add('arduino_variable_get', { NAME: 'ledPin' }));
    nest(sl, 'SETUP', pinMode);

    const on = add('arduino_digital_write');
    plug(on, 'PIN', add('arduino_variable_get', { NAME: 'ledPin' }));
    plug(on, 'VALUE', add('arduino_digital_state', { STATE: 'HIGH' }));
    const wait = add('arduino_delay');
    plug(wait, 'MS', add('math_number', { NUM: 1000 }));
    on.nextConnection.connect(wait.previousConnection);
    nest(sl, 'LOOP', on);

    const code = gen();
    expect(code).toBe(
      'int ledPin = 13;\n\n' +
      'void setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\n' +
      'void loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n}\n',
    );
  });

  test('estructuras de control anidadas', () => {
    const sl = add('arduino_setup_loop');
    const ifElse = add('arduino_if_else_if');
    plug(ifElse, 'IF0', add('logic_boolean', { BOOL: 'TRUE' }));
    plug(ifElse, 'IF1', add('logic_boolean', { BOOL: 'FALSE' }));
    nest(ifElse, 'DO0', add('arduino_break'));
    nest(ifElse, 'DO1', add('arduino_continue'));
    nest(ifElse, 'ELSE', add('arduino_return_void'));
    nest(sl, 'LOOP', ifElse);
    const code = gen();
    expect(code).toContain('if (true) {');
    expect(code).toContain('} else if (false) {');
    expect(code).toContain('} else {');
  });

  test('switch/case con dos casos y default', () => {
    const sl = add('arduino_setup_loop');
    const sw = add('arduino_switch_case');
    plug(sw, 'EXPR', add('arduino_variable_get', { NAME: 'modo' }));
    plug(sw, 'CASE1_VAL', add('math_number', { NUM: 1 }));
    plug(sw, 'CASE2_VAL', add('math_number', { NUM: 2 }));
    nest(sw, 'DO1', add('arduino_break'));
    nest(sw, 'DEFAULT', add('arduino_continue'));
    nest(sl, 'LOOP', sw);
    const code = gen();
    expect(code).toContain('switch (modo) {');
    expect(code).toContain('    case 1:');
    expect(code).toContain('    default:');
  });

  test('do/while y while', () => {
    const sl = add('arduino_setup_loop');
    const dw = add('arduino_do_while');
    plug(dw, 'CONDITION', add('logic_boolean', { BOOL: 'TRUE' }));
    const wh = add('arduino_while');
    dw.nextConnection.connect(wh.previousConnection);
    nest(sl, 'LOOP', dw);
    const code = gen();
    expect(code).toContain('do {');
    expect(code).toContain('} while (true);');
    expect(code).toContain('while (true) {');
  });
});
