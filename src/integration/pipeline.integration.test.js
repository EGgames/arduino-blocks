/**
 * Tests de integración: pipeline completo
 * codeParser → xmlGenerator
 *
 * Verifica que el flujo end-to-end de código Arduino → AST → XML
 * produce bloques Blockly correctos para cada construcción del lenguaje.
 */

import { parseArduinoCode } from '../utils/codeParser';
import { codeToXML } from '../utils/xmlGenerator';

// ─── Helper ───────────────────────────────────────────────────────────────────

const stripIds = (s) => s?.replace(/ id="b\d+"/g, '') ?? null;
const blockCount = (xml, type) =>
  (xml?.match(new RegExp(`type="${type}"`, 'g')) || []).length;

// ─── Casos límite del pipeline ────────────────────────────────────────────────

describe('Pipeline: casos límite', () => {
  test('código vacío → null en ambas etapas', () => {
    const ast = parseArduinoCode('');
    expect(ast.setup).toEqual([]);
    const xml = codeToXML('');
    expect(xml).toBeNull();
  });

  test('código inválido → parser no lanza, generator devuelve null', () => {
    const code = 'esto no es c++';
    expect(() => parseArduinoCode(code)).not.toThrow();
    expect(() => codeToXML(code)).not.toThrow();
    expect(codeToXML(code)).toBeNull();
  });

  test('sketch mínimo vacío → null (sin bloques que mostrar)', () => {
    expect(codeToXML('void setup(){} void loop(){}')).toBeNull();
  });

  test('solo includes sin cuerpo → null', () => {
    expect(codeToXML('#include <Wire.h>\nvoid setup(){}\nvoid loop(){}')).toBeNull();
  });

  test('sketch con contenido → XML no nulo', () => {
    expect(codeToXML('void setup(){ pinMode(13,OUTPUT); } void loop(){}')).not.toBeNull();
  });
});

// ─── Flujo completo: Setup ────────────────────────────────────────────────────

describe('Pipeline: setup → XML', () => {
  const code = `
    void setup() {
      pinMode(13, OUTPUT);
      Serial.begin(9600);
      int led = 13;
    }
    void loop() {}
  `;

  test('parsea 3 sentencias en setup', () => {
    expect(parseArduinoCode(code).setup).toHaveLength(3);
  });

  test('genera bloque arduino_setup_loop', () => {
    expect(codeToXML(code)).toMatch(/arduino_setup_loop/);
  });

  test('genera arduino_pin_mode con PIN=13 y MODE=OUTPUT', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_pin_mode"');
    expect(xml).toContain('<field name="PIN">13</field>');
    expect(xml).toContain('<field name="MODE">OUTPUT</field>');
  });

  test('genera arduino_serial_begin con 9600', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_serial_begin"');
    expect(xml).toContain('>9600<');
  });

  test('genera arduino_variable_declare con TYPE=int y NAME=led', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_variable_declare"');
    expect(xml).toContain('<field name="TYPE">int</field>');
    expect(xml).toContain('<field name="NAME">led</field>');
  });
});

// ─── Flujo completo: Loop ─────────────────────────────────────────────────────

describe('Pipeline: loop → XML', () => {
  const code = `
    void setup() {}
    void loop() {
      digitalWrite(13, HIGH);
      analogWrite(9, 128);
      delay(500);
      Serial.println("hola");
    }
  `;

  test('parsea 4 sentencias en loop', () => {
    expect(parseArduinoCode(code).loop).toHaveLength(4);
  });

  test('genera arduino_digital_write con HIGH', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_digital_write"');
    expect(xml).toContain('<field name="VALUE">HIGH</field>');
  });

  test('genera arduino_analog_write con pin 9', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_analog_write"');
    expect(xml).toContain('<field name="PIN">9</field>');
  });

  test('genera arduino_delay con 500ms', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_delay"');
    expect(xml).toContain('>500<');
  });

  test('genera arduino_serial_println con "hola"', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_serial_println"');
    expect(xml).toContain('hola');
  });
});

// ─── Control de flujo ─────────────────────────────────────────────────────────

describe('Pipeline: control de flujo → XML', () => {
  test('if sin else → bloque arduino_if', () => {
    const code = 'void setup(){} void loop(){ if(x>5){ delay(100); } }';
    const xml = stripIds(codeToXML(code));
    const hasIf = xml.includes('arduino_if_simple') || xml.includes('"arduino_if"');
    expect(hasIf).toBe(true);
  });

  test('if-else → arduino_if con rama ELSE', () => {
    const code = 'void setup(){} void loop(){ if(x>5){ x=1; } else { x=0; } }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_if"');
    expect(xml).toContain('name="ELSE"');
  });

  test('for loop → arduino_for con VAR, FROM y TO', () => {
    const code = 'void setup(){} void loop(){ for(int i=0;i<10;i++){ delay(1); } }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_for"');
    expect(xml).toContain('<field name="VAR">i</field>');
    expect(xml).toContain('<field name="FROM">0</field>');
    expect(xml).toContain('<field name="TO">9</field>');
  });

  test('while loop → arduino_while con CONDITION', () => {
    const code = 'void setup(){} void loop(){ while(active){ delay(10); } }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_while"');
    expect(xml).toContain('name="CONDITION"');
  });

  test('condición == → arduino_compare con OP==', () => {
    const code = 'void setup(){} void loop(){ if(a==b){} }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_compare"');
    expect(xml).toContain('<field name="OP">==</field>');
  });
});

// ─── Includes ─────────────────────────────────────────────────────────────────

describe('Pipeline: includes → XML', () => {
  test('un include → un bloque arduino_include', () => {
    const code = '#include <Servo.h>\nvoid setup(){ pinMode(9,OUTPUT); }\nvoid loop(){}';
    const xml = stripIds(codeToXML(code));
    expect(blockCount(xml, 'arduino_include')).toBe(1);
    expect(xml).toContain('Servo');
  });

  test('tres includes → tres bloques arduino_include', () => {
    const code = `
      #include <Wire.h>
      #include <SPI.h>
      #include <DHT.h>
      void setup(){ pinMode(2,OUTPUT); }
      void loop(){}
    `;
    expect(blockCount(stripIds(codeToXML(code)), 'arduino_include')).toBe(3);
  });

  test('includes parseados correctamente', () => {
    const code = '#include <Servo.h>\nvoid setup(){ delay(1); }\nvoid loop(){}';
    expect(parseArduinoCode(code).includes).toContain('Servo');
  });
});

// ─── Funciones personalizadas ─────────────────────────────────────────────────

describe('Pipeline: funciones personalizadas → XML', () => {
  const code = `
    void setup() {}
    void loop() {}
    void blink() {
      digitalWrite(13, HIGH);
      delay(500);
      digitalWrite(13, LOW);
      delay(500);
    }
  `;

  test('parser detecta 1 función personalizada', () => {
    expect(parseArduinoCode(code).functions).toHaveLength(1);
  });

  test('parser detecta 4 sentencias en el cuerpo', () => {
    expect(parseArduinoCode(code).functions[0].body).toHaveLength(4);
  });

  test('generator produce bloque arduino_function_define', () => {
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('type="arduino_function_define"');
    expect(xml).toContain('blink');
  });
});

// ─── Sketch completo ──────────────────────────────────────────────────────────

describe('Pipeline: sketch completo', () => {
  const fullSketch = `
    #include <Servo.h>
    int ledPin = 13;
    int sensorPin = A0;
    Servo myServo;

    void setup() {
      pinMode(ledPin, OUTPUT);
      Serial.begin(9600);
      myServo.attach(9);
    }

    void loop() {
      int val = analogRead(sensorPin);
      int angle = map(val, 0, 1023, 0, 180);
      if (angle > 90) {
        digitalWrite(ledPin, HIGH);
      } else {
        digitalWrite(ledPin, LOW);
      }
      delay(100);
    }
  `;

  test('parser no lanza excepción', () => {
    expect(() => parseArduinoCode(fullSketch)).not.toThrow();
  });

  test('generator no lanza excepción', () => {
    expect(() => codeToXML(fullSketch)).not.toThrow();
  });

  test('XML no es nulo', () => {
    expect(codeToXML(fullSketch)).not.toBeNull();
  });

  test('XML contiene bloque raíz arduino_setup_loop', () => {
    expect(codeToXML(fullSketch)).toContain('arduino_setup_loop');
  });

  test('XML contiene arduino_pin_mode (setup)', () => {
    expect(stripIds(codeToXML(fullSketch))).toContain('arduino_pin_mode');
  });

  test('XML contiene arduino_serial_begin (setup)', () => {
    expect(stripIds(codeToXML(fullSketch))).toContain('arduino_serial_begin');
  });

  test('XML contiene arduino_if (loop)', () => {
    expect(stripIds(codeToXML(fullSketch))).toContain('arduino_if');
  });

  test('XML contiene arduino_delay (loop)', () => {
    expect(stripIds(codeToXML(fullSketch))).toContain('arduino_delay');
  });

  test('XML contiene arduino_include (Servo)', () => {
    const xml = stripIds(codeToXML(fullSketch));
    expect(xml).toContain('arduino_include');
    expect(xml).toContain('Servo');
  });

  test('AST incluye Servo en includes', () => {
    expect(parseArduinoCode(fullSketch).includes).toContain('Servo');
  });

  test('AST tiene 2 variables globales', () => {
    const ast = parseArduinoCode(fullSketch);
    const globals = ast.globals.filter((g) => g.type === 'vardecl');
    expect(globals.length).toBeGreaterThanOrEqual(2);
  });

  test('AST tiene 3 sentencias en setup', () => {
    expect(parseArduinoCode(fullSketch).setup).toHaveLength(3);
  });
});

// ─── Expresiones aritméticas en pipeline ─────────────────────────────────────

describe('Pipeline: expresiones', () => {
  test('analogRead → arduino_analog_read en XML', () => {
    const code = 'void setup(){} void loop(){ int v = analogRead(A0); }';
    expect(stripIds(codeToXML(code))).toContain('arduino_analog_read');
  });

  test('map() → arduino_map en XML con todos los campos', () => {
    const code = 'void setup(){} void loop(){ int r = map(val, 0, 1023, 0, 255); }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('arduino_map');
    expect(xml).toContain('FROM_LOW');
    expect(xml).toContain('FROM_HIGH');
    expect(xml).toContain('TO_LOW');
    expect(xml).toContain('TO_HIGH');
  });

  test('millis() → arduino_millis en XML', () => {
    const code = 'void setup(){} void loop(){ long t = millis(); }';
    expect(stripIds(codeToXML(code))).toContain('arduino_millis');
  });

  test('operación + → math_arithmetic ADD', () => {
    const code = 'void setup(){} void loop(){ int s = 3 + 4; }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('math_arithmetic');
    expect(xml).toContain('<field name="OP">ADD</field>');
  });

  test('operación * → math_arithmetic MULTIPLY', () => {
    const code = 'void setup(){} void loop(){ int p = 3 * 4; }';
    const xml = stripIds(codeToXML(code));
    expect(xml).toContain('<field name="OP">MULTIPLY</field>');
  });
});
