import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import { defineArduinoBlocks } from '../blocks/arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from '../blocks/arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators } from '../blocks/kidsBlocks';
import { convertWorkspaceXmlToMode, counterpartType, MODE_BLOCK_PAIRS } from './modeConversion';
import { codeToXML } from './xmlGenerator';
import { INITIAL_XML, KIDS_INITIAL_XML } from '../config/initialWorkspace';

Blockly.common.defineBlocks(builtinBlocks);
defineArduinoBlocks();
registerArduinoGenerators(arduinoGenerator);
defineKidsBlocks();
registerKidsGenerators(arduinoGenerator);

/** Genera el código C++ de un workspace descrito en XML */
function codeOf(xml) {
  const ws = new Blockly.Workspace();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws);
    return arduinoGenerator.workspaceToCode(ws);
  } finally {
    ws.dispose();
  }
}

/** Tipos de bloque presentes en un XML */
function typesIn(xml) {
  return [...xml.matchAll(/type="([a-z0-9_]+)"/g)].map((m) => m[1]);
}

const sketch = (setup = '', loop = '') => `void setup() {\n${setup}\n}\nvoid loop() {\n${loop}\n}`;

/** XML de workspace a partir de código Arduino */
const xmlFrom = (code) => codeToXML(code);

describe('Cambio de modo — el programa no cambia', () => {
  test('el ejemplo inicial avanzado se convierte a modo Niño sin alterar el código', () => {
    const kids = convertWorkspaceXmlToMode(INITIAL_XML, 'kids');
    expect(typesIn(kids)).toContain('kids_setup_loop');
    expect(typesIn(kids)).toContain('kids_digital_write');
    expect(codeOf(kids)).toBe(codeOf(INITIAL_XML));
  });

  test('el ejemplo inicial kids se convierte a modo Avanzado sin alterar el código', () => {
    const avanzado = convertWorkspaceXmlToMode(KIDS_INITIAL_XML, 'advanced');
    expect(typesIn(avanzado)).toContain('arduino_setup_loop');
    expect(typesIn(avanzado)).toContain('arduino_digital_write');
    expect(codeOf(avanzado)).toBe(codeOf(KIDS_INITIAL_XML));
  });

  test('ida y vuelta avanzado → niño → avanzado devuelve el mismo programa', () => {
    const kids = convertWorkspaceXmlToMode(INITIAL_XML, 'kids');
    const vuelta = convertWorkspaceXmlToMode(kids, 'advanced');
    expect(codeOf(vuelta)).toBe(codeOf(INITIAL_XML));
    expect(typesIn(vuelta).filter((t) => t.startsWith('kids_'))).toEqual([]);
  });

  test.each([
    ['pines y estado digital', sketch('  pinMode(13, OUTPUT);', '  digitalWrite(13, HIGH);\n  digitalWrite(13, LOW);')],
    ['variable global como pin', 'int ledPin = 9;\n' + sketch('  pinMode(ledPin, OUTPUT);', '  analogWrite(ledPin, 128);')],
    ['lectura analógica', sketch('', '  int v = analogRead(A3);\n  Serial.println(v);')],
    ['bucle for', sketch('', '  for (int i = 0; i <= 5; i++) {\n    delay(10);\n  }')],
    ['condicionales', sketch('', '  if (digitalRead(2) == 1) {\n    tone(8, 440);\n  } else {\n    noTone(8);\n  }')],
    ['while y do-while', sketch('', '  while (x < 5) { x = x + 1; }\n  do { delay(1); } while (x < 9);')],
    ['switch', sketch('', '  switch (modo) {\n    case 1:\n      delay(1);\n      break;\n    case 2:\n      delay(2);\n      break;\n  }')],
    ['variables y listas', 'int datos[4];\n' + sketch('', '  int x = 1;\n  x = 2;\n  datos[0] = x;')],
    ['funciones propias', 'int doble(int x) {\n  return x * 2;\n}\n' + sketch('', '  int y = doble(4);')],
    ['serial y tiempo', sketch('  Serial.begin(9600);', '  Serial.print("t=");\n  Serial.println(millis());\n  delayMicroseconds(50);')],
    ['constantes y defines', '#define LED 13\nconst int MAX = 10;\n' + sketch('  pinMode(LED, OUTPUT);', '  delay(MAX);')],
    ['librerías incluidas', '#include <Servo.h>\n' + sketch('  myServo.attach(9);', '  myServo.write(90);')],
    ['mapeo y límites', sketch('', '  int b = map(analogRead(A0), 0, 1023, 0, 255);\n  int c = constrain(b, 0, 100);')],
  ])('%s: el código es idéntico en ambos modos', (_titulo, codigo) => {
    const avanzado = xmlFrom(codigo);
    expect(avanzado).not.toBeNull();
    const kids = convertWorkspaceXmlToMode(avanzado, 'kids');
    const vuelta = convertWorkspaceXmlToMode(kids, 'advanced');

    const esperado = codeOf(avanzado);
    expect(codeOf(kids)).toBe(esperado);
    expect(codeOf(vuelta)).toBe(esperado);
  });
});

describe('Conversiones con pérdida — el bloque se deja como está', () => {
  const enModoKids = (codigo) => {
    const xml = convertWorkspaceXmlToMode(xmlFrom(codigo), 'kids');
    return { xml, tipos: typesIn(xml), codigo: codeOf(xml) };
  };

  test('Serial.begin a 115200 no se convierte (en modo Niño siempre es 9600)', () => {
    const { tipos, codigo } = enModoKids(sketch('  Serial.begin(115200);'));
    expect(tipos).toContain('arduino_serial_begin');
    expect(tipos).not.toContain('kids_serial_begin');
    expect(codigo).toContain('Serial.begin(115200);');
  });

  test('Serial.begin a 9600 sí se convierte', () => {
    const { tipos, codigo } = enModoKids(sketch('  Serial.begin(9600);'));
    expect(tipos).toContain('kids_serial_begin');
    expect(codigo).toContain('Serial.begin(9600);');
  });

  test('un pin que es una expresión no se convierte', () => {
    const { tipos, codigo } = enModoKids(sketch('  pinMode(base + 1, OUTPUT);'));
    expect(tipos).toContain('arduino_pin_mode');
    expect(codigo).toContain('pinMode((base + 1), OUTPUT);');
  });

  test('un pin analógico fuera del rango del modo Niño no se convierte', () => {
    const { tipos, codigo } = enModoKids(sketch('', '  int v = analogRead(A9);'));
    expect(tipos).toContain('arduino_analog_read');
    expect(codigo).toContain('analogRead(A9)');
  });

  test('un tipo de dato que el modo Niño no ofrece no se convierte', () => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_setup_loop"><statement name="SETUP">
        <block type="arduino_variable_declare"><field name="TYPE">byte</field><field name="NAME">b</field>
          <value name="VALUE"><block type="math_number"><field name="NUM">1</field></block></value>
        </block>
      </statement></block></xml>`;
    const kids = convertWorkspaceXmlToMode(xml, 'kids');
    expect(typesIn(kids)).toContain('arduino_variable_declare');
    expect(codeOf(kids)).toContain('byte b = 1;');
  });

  test('una variable global con volatile no se convierte', () => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_setup_loop"></block>
      <block type="arduino_global_variable_declare" x="10" y="10">
        <field name="STORAGE">volatile</field><field name="TYPE">int</field><field name="NAME">pulsos</field>
        <value name="VALUE"><block type="math_number"><field name="NUM">0</field></block></value>
      </block></xml>`;
    const kids = convertWorkspaceXmlToMode(xml, 'kids');
    expect(typesIn(kids)).toContain('arduino_global_variable_declare');
    expect(codeOf(kids)).toContain('volatile int pulsos = 0;');
  });

  test('un for con límite variable no se convierte pero sigue funcionando', () => {
    const { tipos, codigo } = enModoKids('int total = 5;\n' + sketch('', '  for (int i = 0; i <= total; i++) { delay(1); }'));
    expect(tipos).toContain('arduino_for');
    expect(codigo).toContain('i <= total;');
  });

  test('los bloques sin equivalente en modo Niño se conservan intactos', () => {
    const { tipos, codigo } = enModoKids(sketch('', '  int b = bitRead(x, 3);\n  int m = min(1, 2);'));
    expect(tipos).toContain('arduino_bit_read');
    expect(tipos).toContain('arduino_min_max');
    expect(codigo).toContain('bitRead(x, 3)');
    expect(codigo).toContain('min(1, 2)');
  });

  test('los bloques exclusivos del modo Niño se conservan en modo Avanzado', () => {
    const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="kids_setup_loop"><statement name="SETUP">
        <block type="kids_neopixel_setup"><field name="PIN">6</field><field name="NUM">8</field></block>
      </statement></block></xml>`;
    const avanzado = convertWorkspaceXmlToMode(xml, 'advanced');
    expect(typesIn(avanzado)).toContain('kids_neopixel_setup');
    expect(codeOf(avanzado)).toContain('strip.begin();');
  });
});

describe('Bloques mal formados o incompletos', () => {
  const envolver = (interior) =>
    `<xml xmlns="https://developers.google.com/blockly/xml">${interior}</xml>`;
  const tiposDe = (xml, modo) => typesIn(convertWorkspaceXmlToMode(xml, modo));

  test('un bloque de pin sin nada enchufado no se convierte', () => {
    const xml = envolver('<block type="arduino_pin_mode"><field name="MODE">OUTPUT</field></block>');
    expect(tiposDe(xml, 'kids')).toContain('arduino_pin_mode');
  });

  test('un pin con un número inválido no se convierte', () => {
    const xml = envolver(
      '<block type="arduino_digital_read"><value name="PIN">' +
      '<block type="math_number"><field name="NUM">no-es-un-numero</field></block></value></block>');
    expect(tiposDe(xml, 'kids')).toContain('arduino_digital_read');
  });

  test('un pin por debajo del mínimo o por encima del máximo no se convierte', () => {
    const conPin = (n) => envolver(
      `<block type="arduino_tone"><value name="PIN">` +
      `<block type="math_number"><field name="NUM">${n}</field></block></value></block>`);
    expect(tiposDe(conPin(20), 'kids')).toContain('arduino_tone');
    expect(tiposDe(conPin(-3), 'kids')).toContain('arduino_tone');
    expect(tiposDe(conPin(8), 'kids')).toContain('kids_tone');
  });

  test('digitalWrite con un estado que no es HIGH/LOW no se convierte', () => {
    const xml = envolver(
      '<block type="arduino_digital_write">' +
      '<value name="PIN"><block type="math_number"><field name="NUM">13</field></block></value>' +
      '<value name="VALUE"><block type="arduino_variable_get"><field name="NAME">estado</field></block></value>' +
      '</block>');
    expect(tiposDe(xml, 'kids')).toContain('arduino_digital_write');
  });

  test('analogRead con una variable como pin no se convierte', () => {
    const xml = envolver(
      '<block type="arduino_analog_read"><value name="PIN">' +
      '<block type="arduino_variable_get"><field name="NAME">pinSensor</field></block></value></block>');
    expect(tiposDe(xml, 'kids')).toContain('arduino_analog_read');
  });

  test('analogRead sin pin enchufado no se convierte', () => {
    expect(tiposDe(envolver('<block type="arduino_analog_read"></block>'), 'kids'))
      .toContain('arduino_analog_read');
  });

  test('un pin de modo Niño que no es número ni nombre no se convierte a Avanzado', () => {
    const xml = envolver('<block type="kids_digital_write"><field name="PIN">12-abc</field><field name="VALUE">HIGH</field></block>');
    expect(tiposDe(xml, 'advanced')).toContain('kids_digital_write');
  });

  test('un pin numérico de modo Niño con texto inválido no se convierte a Avanzado', () => {
    const xml = envolver('<block type="kids_digital_read"><field name="PIN">xyz</field></block>');
    expect(tiposDe(xml, 'advanced')).toContain('kids_digital_read');
  });

  test('un pin de modo Niño con nombre de variable sí se convierte', () => {
    const xml = envolver('<block type="kids_pin_mode"><field name="PIN">ledPin</field><field name="MODE">OUTPUT</field></block>');
    const convertido = convertWorkspaceXmlToMode(xml, 'advanced');
    expect(typesIn(convertido)).toContain('arduino_pin_mode');
    expect(convertido).toContain('arduino_variable_get');
  });

  test('el modificador de almacenamiento vacío no impide la conversión', () => {
    const xml = envolver(
      '<block type="arduino_global_variable_declare"><field name="STORAGE"></field>' +
      '<field name="TYPE">int</field><field name="NAME">x</field>' +
      '<value name="VALUE"><block type="math_number"><field name="NUM">1</field></block></value></block>');
    expect(tiposDe(xml, 'kids')).toContain('kids_global_var');
  });

  test('Serial.begin sin campo de velocidad se considera 9600', () => {
    expect(tiposDe(envolver('<block type="arduino_serial_begin"></block>'), 'kids'))
      .toContain('kids_serial_begin');
  });

  test('un for de modo Niño sin límites usa los valores por defecto', () => {
    const convertido = convertWorkspaceXmlToMode(
      envolver('<block type="kids_for"><field name="VAR">i</field></block>'), 'advanced');
    expect(typesIn(convertido)).toContain('arduino_for');
    expect(codeOf(`<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="arduino_setup_loop"><statement name="LOOP">${
        convertido.replace(/^[\s\S]*?<block type="arduino_for"/, '<block type="arduino_for"').replace(/<\/xml>\s*$/, '')
      }</statement></block></xml>`)).toContain('for (int i = 0; i <= 10; i += 1)');
  });

  test('un for de modo Avanzado sin huecos conectados no se convierte', () => {
    expect(tiposDe(envolver('<block type="arduino_for"><field name="VAR">i</field></block>'), 'kids'))
      .toContain('arduino_for');
  });

  test('las sombras también se traducen', () => {
    const xml = envolver(
      '<block type="arduino_digital_write">' +
      '<value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value>' +
      '<value name="VALUE"><shadow type="arduino_digital_state"><field name="STATE">HIGH</field></shadow></value>' +
      '</block>');
    expect(tiposDe(xml, 'kids')).toContain('kids_digital_write');
  });
});

describe('API de conversión', () => {
  test('counterpartType devuelve el tipo del otro modo', () => {
    expect(counterpartType('arduino_delay', 'kids')).toBe('kids_delay');
    expect(counterpartType('kids_delay', 'advanced')).toBe('arduino_delay');
    expect(counterpartType('arduino_bit_read', 'kids')).toBeNull();
    expect(counterpartType('math_number', 'kids')).toBeNull();
  });

  test('cada par apunta a bloques realmente definidos en Blockly', () => {
    for (const par of MODE_BLOCK_PAIRS) {
      expect(Blockly.Blocks[par.advanced]).toBeDefined();
      expect(Blockly.Blocks[par.kids]).toBeDefined();
    }
  });

  test('no hay tipos repetidos en la tabla de equivalencias', () => {
    const tipos = MODE_BLOCK_PAIRS.flatMap((p) => [p.advanced, p.kids]);
    expect(new Set(tipos).size).toBe(tipos.length);
  });

  test('convertir al mismo modo no cambia nada', () => {
    expect(convertWorkspaceXmlToMode(INITIAL_XML, 'advanced')).toBe(INITIAL_XML);
    expect(convertWorkspaceXmlToMode(KIDS_INITIAL_XML, 'kids')).toBe(KIDS_INITIAL_XML);
  });

  test('entradas vacías o inválidas se devuelven tal cual', () => {
    expect(convertWorkspaceXmlToMode('', 'kids')).toBe('');
    expect(convertWorkspaceXmlToMode(null, 'kids')).toBeNull();
    expect(convertWorkspaceXmlToMode(undefined, 'advanced')).toBeUndefined();
    expect(convertWorkspaceXmlToMode(7, 'kids')).toBe(7);
    const roto = '<xml><block type="arduino_delay">';
    expect(convertWorkspaceXmlToMode(roto, 'kids')).toBe(roto);
  });

  test('un XML sin bloques convertibles se devuelve sin cambios', () => {
    const xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="math_number"><field name="NUM">1</field></block></xml>';
    expect(convertWorkspaceXmlToMode(xml, 'kids')).toBe(xml);
  });
});
