import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import { defineArduinoBlocks } from '../blocks/arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from '../blocks/arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators } from '../blocks/kidsBlocks';
import { codeToXML, exprToC } from './xmlGenerator';
import { parseArduinoCode } from './codeParser';

// ──────────────────────────────────────────────────────────────────────────────
// Ida y vuelta completa: código C++ → bloques → código C++
// ──────────────────────────────────────────────────────────────────────────────

Blockly.common.defineBlocks(builtinBlocks);
defineArduinoBlocks();
registerArduinoGenerators(arduinoGenerator);
defineKidsBlocks();
registerKidsGenerators(arduinoGenerator);

/** Convierte código a bloques y de vuelta a código */
function roundTrip(code) {
  const xml = codeToXML(code);
  expect(xml).not.toBeNull();
  const ws = new Blockly.Workspace();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws);
    return arduinoGenerator.workspaceToCode(ws);
  } finally {
    ws.dispose();
  }
}

const sketch = (setup = '', loop = '') =>
  `void setup() {\n${setup}\n}\nvoid loop() {\n${loop}\n}`;

describe('Ida y vuelta código → bloques → código', () => {
  test('blink clásico', () => {
    const salida = roundTrip(sketch(
      '  pinMode(13, OUTPUT);',
      '  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);',
    ));
    expect(salida).toContain('pinMode(13, OUTPUT);');
    expect(salida).toContain('digitalWrite(13, HIGH);');
    expect(salida).toContain('digitalWrite(13, LOW);');
    expect(salida).toContain('delay(1000);');
  });

  test('conserva las variables usadas como pin', () => {
    const salida = roundTrip(
      'int ledPin = 9;\n' + sketch('  pinMode(ledPin, OUTPUT);', '  analogWrite(ledPin, 128);'),
    );
    expect(salida).toContain('int ledPin = 9;');
    expect(salida).toContain('pinMode(ledPin, OUTPUT);');
    expect(salida).toContain('analogWrite(ledPin, 128);');
  });

  test('conserva la lectura analógica con pin A0', () => {
    const salida = roundTrip(sketch('', '  int v = analogRead(A0);\n  Serial.println(v);'));
    expect(salida).toContain('analogRead(A0)');
    expect(salida).toContain('Serial.println(v);');
  });

  test('conserva el bucle for con límite variable', () => {
    const salida = roundTrip(
      'int total = 5;\n' + sketch('', '  for (int i = 0; i < total; i++) {\n    delay(10);\n  }'),
    );
    expect(salida).toContain('for (int i = 0; i <= (total - 1); i += 1)');
  });

  test('for con paso definido por += y -=', () => {
    expect(roundTrip(sketch('', '  for (int i = 0; i <= 10; i += 2) { delay(1); }')))
      .toContain('i += 2');
    expect(roundTrip(sketch('', '  for (int i = 10; i >= 0; i -= 2) { delay(1); }')))
      .toContain('i += -2');
  });

  test('for con condición estricta > ajusta el límite', () => {
    expect(roundTrip(sketch('', '  for (int i = 10; i > 0; i--) { delay(1); }')))
      .toContain('i >= 1;');
  });

  test('for cuyo contador ya existe', () => {
    const salida = roundTrip('int i = 0;\n' + sketch('', '  for (i = 0; i <= 3; i++) { delay(1); }'));
    expect(salida).toContain('for (int i = 0; i <= 3');
  });

  test('conserva tone con duración', () => {
    expect(roundTrip(sketch('', '  tone(8, 440, 500);'))).toContain('tone(8, 440, 500);');
  });

  test('conserva las llamadas desconocidas con sus argumentos', () => {
    const salida = roundTrip(sketch('  lcd.begin(16, 2);', '  lcd.print("Hola");'));
    expect(salida).toContain('lcd.begin(16, 2);');
    expect(salida).toContain('lcd.print("Hola");');
  });

  test('conserva expresiones de llamada desconocidas', () => {
    const salida = roundTrip(sketch('', '  int t = dht.readTemperature();'));
    expect(salida).toContain('dht.readTemperature()');
  });

  test('conserva bitWrite, bitSet y bitClear', () => {
    const salida = roundTrip(sketch('', '  bitWrite(flags, 2, 1);\n  bitSet(flags, 0);\n  bitClear(flags, 1);'));
    expect(salida).toContain('bitWrite(flags, 2, 1);');
    expect(salida).toContain('bitSet(flags, 0);');
    expect(salida).toContain('bitClear(flags, 1);');
  });

  test('conserva min, max, random y bit', () => {
    const salida = roundTrip(sketch('', '  int a = min(1, 2);\n  int b = max(3, 4);\n  int c = random(1, 7);\n  int d = bit(3);'));
    expect(salida).toContain('min(1, 2)');
    expect(salida).toContain('max(3, 4)');
    expect(salida).toContain('random(1, 7)');
    expect(salida).toContain('bit(3)');
  });

  test('conserva lowByte/highByte y pulseIn', () => {
    const salida = roundTrip(sketch('', '  byte b = lowByte(1025);\n  byte h = highByte(1025);\n  long d = pulseIn(7, HIGH);'));
    expect(salida).toContain('lowByte(1025)');
    expect(salida).toContain('highByte(1025)');
    expect(salida).toContain('pulseIn(7, HIGH)');
  });

  test('conserva shiftOut y analogReference', () => {
    const salida = roundTrip(sketch('  analogReference(INTERNAL);', '  shiftOut(11, 12, MSBFIRST, 255);'));
    expect(salida).toContain('analogReference(INTERNAL);');
    expect(salida).toContain('shiftOut(11, 12, MSBFIRST, 255);');
  });

  test('conserva interrupts y noInterrupts', () => {
    const salida = roundTrip(sketch('', '  noInterrupts();\n  interrupts();'));
    expect(salida).toContain('noInterrupts();');
    expect(salida).toContain('interrupts();');
  });

  test('conserva las utilidades del Serial', () => {
    const salida = roundTrip(sketch(
      '  Serial.begin(9600);',
      '  Serial.write(65);\n  Serial.println();\n  Serial.flush();\n  int n = Serial.parseInt();',
    ));
    expect(salida).toContain('Serial.write(65);');
    expect(salida).toContain('Serial.println();');
    expect(salida).toContain('Serial.flush();');
    expect(salida).toContain('Serial.parseInt()');
  });

  test('conserva randomSeed y micros', () => {
    const salida = roundTrip(sketch('  randomSeed(analogRead(A0));', '  unsigned long t = micros();'));
    expect(salida).toContain('randomSeed(analogRead(A0));');
    expect(salida).toContain('micros()');
  });

  test('conserva operadores lógicos, de comparación y de bits', () => {
    const salida = roundTrip(sketch('', '  if ((a > 1) && (b < 2)) {\n    x = (a % 2);\n    y = (a & b);\n    z = ~a;\n  }'));
    expect(salida).toContain('&&');
    expect(salida).toContain('%');
    expect(salida).toContain('&');
    expect(salida).toContain('~');
  });

  test('conserva while, do-while y switch', () => {
    expect(roundTrip(sketch('', '  while (x < 5) { x++; }'))).toContain('while ');
    expect(roundTrip(sketch('', '  do { x++; } while (x < 5);'))).toContain('do {');
    const sw = roundTrip(sketch('', '  switch (modo) {\n    case 1:\n      delay(1);\n      break;\n    case 2:\n      delay(2);\n      break;\n    default:\n      delay(3);\n  }'));
    expect(sw).toContain('switch (modo)');
    expect(sw).toContain('case 1:');
    expect(sw).toContain('default:');
  });

  test('conserva funciones propias con parámetros y retorno', () => {
    const salida = roundTrip('int doble(int x) {\n  return x * 2;\n}\n' + sketch('', '  int y = doble(4);'));
    expect(salida).toContain('int doble(int x) {');
    expect(salida).toContain('return');
    expect(salida).toContain('doble(4)');
  });

  test('conserva includes, defines, arrays y comentarios', () => {
    const salida = roundTrip(
      '#include <Servo.h>\n#define LED 13\nint datos[4];\n' +
      sketch('  // configuro todo', '  datos[0] = 1;'),
    );
    expect(salida).toContain('#include <Servo.h>');
    expect(salida).toContain('#define LED 13');
    expect(salida).toContain('int datos[4];');
    expect(salida).toContain('// configuro todo');
  });

  test('conserva incrementos como sentencia', () => {
    const salida = roundTrip(sketch('', '  contador++;\n  otro--;'));
    expect(salida).toContain('contador = (contador + 1);');
    expect(salida).toContain('otro = (otro - 1);');
  });

  test('conserva textos, booleanos y negaciones', () => {
    const salida = roundTrip(sketch('', '  Serial.println("hola");\n  bool activo = true;\n  if (!activo) { delay(1); }'));
    expect(salida).toContain('"hola"');
    expect(salida).toContain('true');
    expect(salida).toContain('!(');
  });

  test('un valor negativo se convierte en resta desde cero', () => {
    expect(roundTrip(sketch('', '  int x = -5;'))).toContain('(0 - 5)');
  });

  test('devuelve null cuando el sketch no tiene setup, loop ni funciones', () => {
    expect(codeToXML('int soloUnaVariable = 1;')).toBeNull();
  });
});

describe('Casos límite de la conversión a bloques', () => {
  test('array declarado dentro de setup', () => {
    const salida = roundTrip(sketch('  int datos[3] = {1, 2, 3};'));
    expect(salida).toContain('int datos[3];');
  });

  test('array local sin tipo reconocido cae en int', () => {
    const salida = roundTrip(sketch('  uint8_t buffer[2];'));
    expect(salida).toContain('[2];');
  });

  test('bitRead como expresión', () => {
    expect(roundTrip(sketch('', '  int b = bitRead(valor, 3);'))).toContain('bitRead(valor, 3)');
  });

  test('incremento usado como expresión conserva la variable', () => {
    expect(roundTrip(sketch('', '  x = i++;'))).toContain('x = i;');
  });

  test('digitalWrite con 1 y 0 se traduce a HIGH y LOW', () => {
    expect(roundTrip(sketch('', '  digitalWrite(13, 1);'))).toContain('digitalWrite(13, HIGH);');
    expect(roundTrip(sketch('', '  digitalWrite(13, 0);'))).toContain('digitalWrite(13, LOW);');
  });

  test('digitalWrite con una variable de estado', () => {
    expect(roundTrip(sketch('', '  digitalWrite(13, estado);'))).toContain('digitalWrite(13, estado);');
  });

  test('pinMode con un modo numérico cae en OUTPUT', () => {
    expect(roundTrip(sketch('  pinMode(13, 1);'))).toContain('pinMode(13, OUTPUT);');
  });

  test('pinMode con INPUT y INPUT_PULLUP', () => {
    expect(roundTrip(sketch('  pinMode(2, INPUT);'))).toContain('pinMode(2, INPUT);');
    expect(roundTrip(sketch('  pinMode(2, INPUT_PULLUP);'))).toContain('pinMode(2, INPUT_PULLUP);');
  });

  test('Serial.begin con una variable usa la velocidad por defecto', () => {
    expect(roundTrip(sketch('  Serial.begin(baudRate);'))).toContain('Serial.begin(9600);');
  });

  test('Serial.begin redondea a la velocidad soportada más cercana', () => {
    expect(roundTrip(sketch('  Serial.begin(9800);'))).toContain('Serial.begin(9600);');
    expect(roundTrip(sketch('  Serial.begin(115200);'))).toContain('Serial.begin(115200);');
  });

  test('una asignación anidada no rompe la conversión', () => {
    expect(roundTrip(sketch('', '  x = (y = 2);'))).toContain('x = ');
  });

  test('un tipo de variable global desconocido cae en int', () => {
    expect(roundTrip('uint16_t contador = 0;\n' + sketch('  delay(1);')))
      .toContain('int contador = 0;');
  });

  test('analogRead con una variable como pin', () => {
    expect(roundTrip(sketch('', '  int v = analogRead(pinSensor);'))).toContain('analogRead(pinSensor)');
  });

  test('delay sin argumentos usa el valor por defecto', () => {
    expect(roundTrip(sketch('', '  delay();'))).toContain('delay(0);');
  });

  test('las funciones sin parámetros no emiten el campo PARAMS', () => {
    const salida = roundTrip('void saludar() {\n  Serial.println("hola");\n}\n' + sketch());
    expect(salida).toContain('void saludar() {');
  });

  test('normaliza los tipos de retorno poco comunes', () => {
    expect(roundTrip('double media() {\n  return 1;\n}\n' + sketch())).toContain('float media()');
    expect(roundTrip('char inicial() {\n  return 1;\n}\n' + sketch())).toContain('byte inicial()');
    expect(roundTrip('unsigned long tiempo() {\n  return 1;\n}\n' + sketch())).toContain('long tiempo()');
  });
});

describe('exprToC — reconstrucción de expresiones', () => {
  const parse = (expr) => parseArduinoCode(sketch('', `  x = ${expr};`)).loop[0].expr.value;

  test('números, textos y booleanos', () => {
    expect(exprToC(parse('42'))).toBe('42');
    expect(exprToC(parse('"hola"'))).toBe('"hola"');
    expect(exprToC(parse('true'))).toBe('true');
  });

  test('operaciones y llamadas', () => {
    expect(exprToC(parse('a + b * 2'))).toContain('+');
    expect(exprToC(parse('miFuncion(1, 2)'))).toBe('miFuncion(1, 2)');
    expect(exprToC(parse('-a'))).toBe('-a');
    expect(exprToC(parse('!a'))).toBe('!a');
    expect(exprToC(parse('~a'))).toBe('~a');
  });

  test('incrementos en sus cuatro formas', () => {
    expect(exprToC({ type: 'unop', op: '++post', operand: { type: 'ident', name: 'i' } })).toBe('i++');
    expect(exprToC({ type: 'unop', op: '--post', operand: { type: 'ident', name: 'i' } })).toBe('i--');
    expect(exprToC({ type: 'unop', op: '++pre', operand: { type: 'ident', name: 'i' } })).toBe('++i');
    expect(exprToC({ type: 'unop', op: '--pre', operand: { type: 'ident', name: 'i' } })).toBe('--i');
  });

  test('asignaciones y casos límite', () => {
    expect(exprToC({ type: 'assign', op: '+=', target: { type: 'ident', name: 'x' }, value: { type: 'num', value: 1 } }))
      .toBe('x += 1');
    expect(exprToC(null)).toBe('');
    expect(exprToC({ type: 'desconocido' })).toBe('');
  });

  test('escapa las comillas dentro de un texto', () => {
    expect(exprToC({ type: 'str', value: 'di "hola"' })).toBe('"di \\"hola\\""');
  });
});
