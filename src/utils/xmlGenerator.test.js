import { codeToXML } from './xmlGenerator';

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Quita los id="bXX" para comparaciones independientes del contador interno */
const stripIds = (xml) => xml?.replace(/ id="b\d+"/g, '') ?? null;

/** Envuelve código en setup/loop estándar */
const wrapSetup = (body) => `void setup() { ${body} } void loop() {}`;
const wrapLoop  = (body) => `void setup() {} void loop() { ${body} }`;

// ─── Retorno de null en casos sin bloque principal ───────────────────────────

describe('codeToXML — retorna null', () => {
  test('código vacío → null', () => {
    expect(codeToXML('')).toBeNull();
  });

  test('sin setup ni loop → null', () => {
    expect(codeToXML('int x = 5;')).toBeNull();
  });

  test('setup y loop vacíos → null (nada que representar)', () => {
    expect(codeToXML('void setup(){} void loop(){}')).toBeNull();
  });
});

// ─── Estructura XML del workspace ────────────────────────────────────────────

describe('codeToXML — estructura raíz', () => {
  test('produce un elemento <xml>', () => {
    const xml = codeToXML(wrapSetup('pinMode(13, OUTPUT);'));
    expect(xml).toMatch(/^<xml/);
    expect(xml).toMatch(/<\/xml>$/);
  });

  test('contiene un bloque arduino_setup_loop', () => {
    const xml = stripIds(codeToXML(wrapSetup('delay(500);')));
    expect(xml).toContain('type="arduino_setup_loop"');
  });
});

// ─── Bloques en setup ────────────────────────────────────────────────────────

describe('codeToXML — setup', () => {
  test('pinMode genera arduino_pin_mode con PIN y MODE', () => {
    const xml = stripIds(codeToXML(wrapSetup('pinMode(13, OUTPUT);')));
    expect(xml).toContain('type="arduino_pin_mode"');
    expect(xml).toContain('<field name="PIN">13</field>');
    expect(xml).toContain('<field name="MODE">OUTPUT</field>');
  });

  test('pinMode conserva nombre de variable global como pin', () => {
    const xml = stripIds(codeToXML(`
      int ledPin = 13;
      void setup() { pinMode(ledPin, OUTPUT); }
      void loop() {}
    `));
    expect(xml).toContain('type="arduino_pin_mode"');
    expect(xml).toContain('<field name="PIN">ledPin</field>');
    expect(xml).toContain('<field name="MODE">OUTPUT</field>');
  });

  test('pinMode conserva nombre definido por #define como pin', () => {
    const xml = stripIds(codeToXML(`
      #define LED_PIN 13
      void setup() { pinMode(LED_PIN, OUTPUT); }
      void loop() {}
    `));
    expect(xml).toContain('type="arduino_pin_mode"');
    expect(xml).toContain('<field name="PIN">LED_PIN</field>');
    expect(xml).toContain('<field name="MODE">OUTPUT</field>');
  });

  test('Serial.begin genera arduino_serial_begin', () => {
    const xml = stripIds(codeToXML(wrapSetup('Serial.begin(9600);')));
    expect(xml).toContain('type="arduino_serial_begin"');
    expect(xml).toContain('>9600<');
  });

  test('declaración int genera arduino_variable_declare', () => {
    const xml = stripIds(codeToXML(wrapSetup('int x = 5;')));
    expect(xml).toContain('type="arduino_variable_declare"');
    expect(xml).toContain('<field name="TYPE">int</field>');
    expect(xml).toContain('<field name="NAME">x</field>');
  });

  test('declaración float', () => {
    const xml = stripIds(codeToXML(wrapSetup('float temp = 3.0;')));
    expect(xml).toContain('<field name="TYPE">float</field>');
  });

  test('declaración bool', () => {
    const xml = stripIds(codeToXML(wrapSetup('bool active = true;')));
    expect(xml).toContain('<field name="TYPE">bool</field>');
  });
});

// ─── Bloques en loop ─────────────────────────────────────────────────────────

describe('codeToXML — loop', () => {
  test('digitalWrite HIGH genera arduino_digital_write', () => {
    const xml = stripIds(codeToXML(wrapLoop('digitalWrite(13, HIGH);')));
    expect(xml).toContain('type="arduino_digital_write"');
    expect(xml).toContain('<field name="PIN">13</field>');
    expect(xml).toContain('<field name="VALUE">HIGH</field>');
  });

  test('digitalWrite conserva nombre de variable global como pin', () => {
    const xml = stripIds(codeToXML(`
      int ledPin = 13;
      void setup() {}
      void loop() { digitalWrite(ledPin, HIGH); }
    `));
    expect(xml).toContain('type="arduino_digital_write"');
    expect(xml).toContain('<field name="PIN">ledPin</field>');
    expect(xml).toContain('<field name="VALUE">HIGH</field>');
  });

  test('digitalWrite conserva nombre definido por #define como pin', () => {
    const xml = stripIds(codeToXML(`
      #define LED_PIN 13
      void setup() {}
      void loop() { digitalWrite(LED_PIN, LOW); }
    `));
    expect(xml).toContain('type="arduino_digital_write"');
    expect(xml).toContain('<field name="PIN">LED_PIN</field>');
    expect(xml).toContain('<field name="VALUE">LOW</field>');
  });

  test('digitalWrite LOW', () => {
    const xml = stripIds(codeToXML(wrapLoop('digitalWrite(5, LOW);')));
    expect(xml).toContain('<field name="VALUE">LOW</field>');
  });

  test('analogWrite genera arduino_analog_write', () => {
    const xml = stripIds(codeToXML(wrapLoop('analogWrite(9, 128);')));
    expect(xml).toContain('type="arduino_analog_write"');
    expect(xml).toContain('<field name="PIN">9</field>');
  });

  test('analogWrite conserva nombre de variable global como pin', () => {
    const xml = stripIds(codeToXML(`
      int pwmPin = 9;
      void setup() {}
      void loop() { analogWrite(pwmPin, 128); }
    `));
    expect(xml).toContain('type="arduino_analog_write"');
    expect(xml).toContain('<field name="PIN">pwmPin</field>');
  });

  test('analogWrite conserva nombre definido por #define como pin', () => {
    const xml = stripIds(codeToXML(`
      #define PWM_PIN 9
      void setup() {}
      void loop() { analogWrite(PWM_PIN, 200); }
    `));
    expect(xml).toContain('type="arduino_analog_write"');
    expect(xml).toContain('<field name="PIN">PWM_PIN</field>');
  });

  test('delay genera arduino_delay con value MS', () => {
    const xml = stripIds(codeToXML(wrapLoop('delay(1000);')));
    expect(xml).toContain('type="arduino_delay"');
    expect(xml).toContain('name="MS"');
    expect(xml).toContain('>1000<');
  });

  test('delayMicroseconds', () => {
    const xml = stripIds(codeToXML(wrapLoop('delayMicroseconds(500);')));
    expect(xml).toContain('type="arduino_delay_microseconds"');
  });

  test('Serial.println genera arduino_serial_println', () => {
    const xml = stripIds(codeToXML(wrapLoop('Serial.println("hola");')));
    expect(xml).toContain('type="arduino_serial_println"');
    expect(xml).toContain('hola');
  });

  test('Serial.print genera arduino_serial_print', () => {
    const xml = stripIds(codeToXML(wrapLoop('Serial.print(val);')));
    expect(xml).toContain('type="arduino_serial_print"');
  });

  test('tone genera arduino_tone', () => {
    const xml = stripIds(codeToXML(wrapLoop('tone(8, 440);')));
    expect(xml).toContain('type="arduino_tone"');
    expect(xml).toContain('<field name="PIN">8</field>');
  });

  test('noTone genera arduino_no_tone', () => {
    const xml = stripIds(codeToXML(wrapLoop('noTone(8);')));
    expect(xml).toContain('type="arduino_no_tone"');
    expect(xml).toContain('<field name="PIN">8</field>');
  });
});

// ─── Control de flujo ────────────────────────────────────────────────────────

describe('codeToXML — if / if-else', () => {
  test('if sin else genera arduino_if_simple o arduino_if', () => {
    const xml = stripIds(codeToXML(wrapLoop('if (x > 5) { digitalWrite(13, HIGH); }')));
    const hasIf = xml.includes('arduino_if_simple') || xml.includes('arduino_if"');
    expect(hasIf).toBe(true);
  });

  test('if-else genera arduino_if con rama ELSE', () => {
    const xml = stripIds(codeToXML(wrapLoop('if (x > 5) { x = 1; } else { x = 0; }')));
    expect(xml).toContain('type="arduino_if"');
    expect(xml).toContain('name="ELSE"');
  });

  test('condición genera arduino_compare', () => {
    const xml = stripIds(codeToXML(wrapLoop('if (a == b) {}')));
    expect(xml).toContain('type="arduino_compare"');
    expect(xml).toContain('<field name="OP">==</field>');
  });

  test('condición >= genera el operador correcto', () => {
    const xml = stripIds(codeToXML(wrapLoop('if (count >= 10) {}')));
    expect(xml).toContain('<field name="OP">&gt;=</field>');
  });
});

describe('codeToXML — for', () => {
  test('for genera arduino_for', () => {
    const xml = stripIds(codeToXML(wrapLoop('for (int i = 0; i < 10; i++) { delay(100); }')));
    expect(xml).toContain('type="arduino_for"');
    expect(xml).toContain('<field name="VAR">i</field>');
    expect(xml).toContain('<field name="FROM">0</field>');
  });

  test('for con limit < N resulta en TO = N-1', () => {
    const xml = stripIds(codeToXML(wrapLoop('for (int i = 0; i < 5; i++) {}')));
    expect(xml).toContain('<field name="TO">4</field>');
  });

  test('for con limit <= N resulta en TO = N', () => {
    const xml = stripIds(codeToXML(wrapLoop('for (int i = 0; i <= 5; i++) {}')));
    expect(xml).toContain('<field name="TO">5</field>');
  });
});

describe('codeToXML — while', () => {
  test('while genera arduino_while', () => {
    const xml = stripIds(codeToXML(wrapLoop('while (active) { delay(10); }')));
    expect(xml).toContain('type="arduino_while"');
    expect(xml).toContain('name="CONDITION"');
  });
});

// ─── Comentarios ─────────────────────────────────────────────────────────────

describe('codeToXML — comentarios', () => {
  test('comentario de línea genera arduino_comment', () => {
    const xml = stripIds(codeToXML(wrapSetup('// encender LED\npinMode(13, OUTPUT);')));
    expect(xml).toContain('type="arduino_comment"');
    expect(xml).toContain('encender LED');
  });
});

// ─── Expresiones como valores ─────────────────────────────────────────────────

describe('codeToXML — expresiones en values', () => {
  test('analogWrite con analogRead genera arduino_analog_read como value', () => {
    const xml = stripIds(codeToXML(wrapLoop('analogWrite(9, analogRead(A0));')));
    expect(xml).toContain('type="arduino_analog_read"');
  });

  test('map() genera arduino_map', () => {
    const xml = stripIds(codeToXML(wrapLoop('int r = map(val, 0, 1023, 0, 255);')));
    expect(xml).toContain('type="arduino_map"');
    expect(xml).toContain('name="FROM_LOW"');
    expect(xml).toContain('name="FROM_HIGH"');
    expect(xml).toContain('name="TO_LOW"');
    expect(xml).toContain('name="TO_HIGH"');
  });

  test('constrain() genera arduino_constrain', () => {
    const xml = stripIds(codeToXML(wrapLoop('int r = constrain(v, 0, 100);')));
    expect(xml).toContain('type="arduino_constrain"');
  });

  test('millis() genera arduino_millis', () => {
    const xml = stripIds(codeToXML(wrapLoop('long t = millis();')));
    expect(xml).toContain('type="arduino_millis"');
  });

  test('operación aritmética genera math_arithmetic', () => {
    const xml = stripIds(codeToXML(wrapLoop('int s = 3 + 4;')));
    expect(xml).toContain('type="math_arithmetic"');
    expect(xml).toContain('<field name="OP">ADD</field>');
  });

  test('lógica && genera arduino_logic', () => {
    const xml = stripIds(codeToXML(wrapLoop('if (a && b) {}')));
    expect(xml).toContain('type="arduino_logic"');
    expect(xml).toContain('<field name="OP">&&</field>');
  });

  test('negación ! genera arduino_not', () => {
    const xml = stripIds(codeToXML(wrapLoop('if (!flag) {}')));
    expect(xml).toContain('type="arduino_not"');
  });
});

// ─── Includes ────────────────────────────────────────────────────────────────

describe('codeToXML — includes', () => {
  test('include genera bloque arduino_include', () => {
    const xml = stripIds(codeToXML(`
      #include <Servo.h>
      void setup() { pinMode(9, OUTPUT); }
      void loop() {}
    `));
    expect(xml).toContain('type="arduino_include"');
    expect(xml).toContain('Servo');
  });

  test('múltiples includes generan múltiples bloques arduino_include', () => {
    const xml = stripIds(codeToXML(`
      #include <Wire.h>
      #include <DHT.h>
      void setup() { pinMode(2, OUTPUT); }
      void loop() {}
    `));
    const count = (xml.match(/type="arduino_include"/g) || []).length;
    expect(count).toBe(2);
  });
});

// ─── Funciones personalizadas ─────────────────────────────────────────────────

describe('codeToXML — funciones personalizadas', () => {
  test('función void genera bloque arduino_function_define', () => {
    const xml = stripIds(codeToXML(`
      void setup() {}
      void loop() {}
      void blink() { digitalWrite(13, HIGH); }
    `));
    expect(xml).toContain('type="arduino_function_define"');
    expect(xml).toContain('blink');
  });
});

// ─── Robustez ─────────────────────────────────────────────────────────────────

describe('codeToXML — robustez', () => {
  test('código inválido no lanza excepción', () => {
    expect(() => codeToXML('esto no es código arduino')).not.toThrow();
  });

  test('sketch completo produce XML válido con bloques de setup y loop', () => {
    const code = `
      #include <Servo.h>
      int ledPin = 13;
      void setup() {
        pinMode(ledPin, OUTPUT);
        Serial.begin(9600);
      }
      void loop() {
        digitalWrite(ledPin, HIGH);
        delay(500);
        digitalWrite(ledPin, LOW);
        delay(500);
      }
    `;
    const xml = codeToXML(code);
    expect(xml).not.toBeNull();
    expect(xml).toContain('arduino_setup_loop');
    expect(xml).toContain('arduino_pin_mode');
    expect(xml).toContain('arduino_serial_begin');
    expect(xml).toContain('arduino_digital_write');
    expect(xml).toContain('arduino_delay');
  });

  test('asignación de variable genera arduino_variable_set', () => {
    const xml = stripIds(codeToXML(wrapLoop('x = 42;')));
    expect(xml).toContain('type="arduino_variable_set"');
    expect(xml).toContain('<field name="NAME">x</field>');
  });
});
