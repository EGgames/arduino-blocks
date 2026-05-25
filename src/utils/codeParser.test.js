import { parseArduinoCode } from './codeParser';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parsea y devuelve el AST limpio */
const parse = (code) => parseArduinoCode(code);

/** Extrae el primer stmt del setup */
const setup0 = (code) => parse(code).setup[0];

/** Extrae el primer stmt del loop */
const loop0 = (code) => parse(code).loop[0];

// ─── Estructura básica del programa ──────────────────────────────────────────

describe('parseArduinoCode — estructura del programa', () => {
  test('sketch vacío devuelve arrays vacíos y sin error', () => {
    const ast = parse(`void setup() {}\nvoid loop() {}`);
    expect(ast.error).toBeFalsy();
    expect(ast.setup).toEqual([]);
    expect(ast.loop).toEqual([]);
    expect(ast.includes).toEqual([]);
    expect(ast.globals).toEqual([]);
  });

  test('sin setup ni loop devuelve arrays vacíos', () => {
    const ast = parse('');
    expect(ast.setup).toEqual([]);
    expect(ast.loop).toEqual([]);
  });

  test('parsea includes antes de setup/loop', () => {
    const ast = parse(`
      #include <Wire.h>
      #include <Servo.h>
      void setup() {}
      void loop() {}
    `);
    expect(ast.includes).toContain('Wire');
    expect(ast.includes).toContain('Servo');
    expect(ast.includes).toHaveLength(2);
  });

  test('include con comillas dobles', () => {
    const ast = parse('#include "myLib.h"\nvoid setup(){}\nvoid loop(){}');
    expect(ast.includes).toContain('myLib');
  });

  test('include sin extensión .h se conserva tal cual', () => {
    const ast = parse('#include <Ethernet>\nvoid setup(){}\nvoid loop(){}');
    expect(ast.includes).toContain('Ethernet');
  });
});

// ─── Variables globales ───────────────────────────────────────────────────────

describe('parseArduinoCode — variables globales', () => {
  test('variable global int sin valor inicial', () => {
    const ast = parse('int x;\nvoid setup(){}\nvoid loop(){}');
    const g = ast.globals[0];
    expect(g.type).toBe('vardecl');
    expect(g.varType).toBe('int');
    expect(g.name).toBe('x');
    expect(g.value).toBeNull();
  });

  test('variable global float con valor inicial', () => {
    const ast = parse('float temp = 3.14;\nvoid setup(){}\nvoid loop(){}');
    const g = ast.globals[0];
    expect(g.varType).toBe('float');
    expect(g.name).toBe('temp');
    expect(g.value.type).toBe('num');
    expect(g.value.value).toBeCloseTo(3.14);
  });

  test('variable global bool', () => {
    const ast = parse('bool flag = true;\nvoid setup(){}\nvoid loop(){}');
    const g = ast.globals[0];
    expect(g.varType).toBe('bool');
    expect(g.value.type).toBe('bool');
    expect(g.value.value).toBe(true);
  });

  test('constante con const int', () => {
    const ast = parse('const int LED = 13;\nvoid setup(){}\nvoid loop(){}');
    const g = ast.globals[0];
    expect(g.varType).toBe('const int');
    expect(g.name).toBe('LED');
  });
});

// ─── Declaraciones de variables en cuerpo ─────────────────────────────────────

describe('parseArduinoCode — vardecl en setup/loop', () => {
  test('int con valor numérico', () => {
    const s = setup0('void setup() { int x = 5; } void loop() {}');
    expect(s.type).toBe('vardecl');
    expect(s.varType).toBe('int');
    expect(s.name).toBe('x');
    expect(s.value).toMatchObject({ type: 'num', value: 5 });
  });

  test('String con literal', () => {
    const s = setup0('void setup() { String msg = "hello"; } void loop() {}');
    expect(s.varType).toBe('String');
    expect(s.value.type).toBe('str');
    expect(s.value.value).toBe('hello');
  });

  test('variable sin valor inicial', () => {
    const s = setup0('void setup() { int y; } void loop() {}');
    expect(s.value).toBeNull();
  });

  test('unsigned int', () => {
    const s = setup0('void setup() { unsigned int n = 100; } void loop() {}');
    expect(s.varType).toBe('unsigned int');
  });
});

// ─── Llamadas a funciones ─────────────────────────────────────────────────────

describe('parseArduinoCode — llamadas (exprStmt)', () => {
  test('pinMode', () => {
    const s = setup0('void setup() { pinMode(13, OUTPUT); } void loop() {}');
    expect(s.type).toBe('exprStmt');
    expect(s.expr.type).toBe('call');
    expect(s.expr.name).toBe('pinMode');
    expect(s.expr.args[0]).toMatchObject({ type: 'num', value: 13 });
    expect(s.expr.args[1]).toMatchObject({ type: 'ident', name: 'OUTPUT' });
  });

  test('digitalWrite', () => {
    const s = loop0('void setup(){} void loop() { digitalWrite(13, HIGH); }');
    expect(s.expr.name).toBe('digitalWrite');
    expect(s.expr.args[0]).toMatchObject({ type: 'num', value: 13 });
    expect(s.expr.args[1]).toMatchObject({ type: 'ident', name: 'HIGH' });
  });

  test('analogWrite', () => {
    const s = loop0('void setup(){} void loop() { analogWrite(9, 128); }');
    expect(s.expr.name).toBe('analogWrite');
    expect(s.expr.args[1]).toMatchObject({ type: 'num', value: 128 });
  });

  test('delay', () => {
    const s = loop0('void setup(){} void loop() { delay(1000); }');
    expect(s.expr.name).toBe('delay');
    expect(s.expr.args[0]).toMatchObject({ type: 'num', value: 1000 });
  });

  test('Serial.begin', () => {
    const s = setup0('void setup() { Serial.begin(9600); } void loop() {}');
    expect(s.expr.type).toBe('call');
    expect(s.expr.name).toBe('Serial.begin');
    expect(s.expr.args[0]).toMatchObject({ type: 'num', value: 9600 });
  });

  test('Serial.println con string', () => {
    const s = loop0('void setup(){} void loop() { Serial.println("hola"); }');
    expect(s.expr.name).toBe('Serial.println');
    expect(s.expr.args[0]).toMatchObject({ type: 'str', value: 'hola' });
  });

  test('tone con dos argumentos', () => {
    const s = loop0('void setup(){} void loop() { tone(8, 440); }');
    expect(s.expr.name).toBe('tone');
    expect(s.expr.args[0]).toMatchObject({ type: 'num', value: 8 });
    expect(s.expr.args[1]).toMatchObject({ type: 'num', value: 440 });
  });

  test('noTone', () => {
    const s = loop0('void setup(){} void loop() { noTone(8); }');
    expect(s.expr.name).toBe('noTone');
  });
});

// ─── Asignaciones ─────────────────────────────────────────────────────────────

describe('parseArduinoCode — asignaciones', () => {
  test('asignación simple =', () => {
    const s = loop0('void setup(){} void loop() { x = 10; }');
    expect(s.expr.type).toBe('assign');
    expect(s.expr.op).toBe('=');
    expect(s.expr.target.name).toBe('x');
    expect(s.expr.value).toMatchObject({ type: 'num', value: 10 });
  });

  test('asignación +=', () => {
    const s = loop0('void setup(){} void loop() { x += 5; }');
    expect(s.expr.op).toBe('+=');
  });

  test('asignación -=', () => {
    const s = loop0('void setup(){} void loop() { x -= 3; }');
    expect(s.expr.op).toBe('-=');
  });
});

// ─── Control de flujo — if ───────────────────────────────────────────────────

describe('parseArduinoCode — if / if-else', () => {
  test('if simple sin else', () => {
    const s = loop0(`
      void setup(){}
      void loop() {
        if (x > 5) { digitalWrite(13, HIGH); }
      }
    `);
    expect(s.type).toBe('if');
    expect(s.cond).toMatchObject({ type: 'binop', op: '>' });
    expect(s.then).toHaveLength(1);
    expect(s.else).toHaveLength(0);
  });

  test('if-else', () => {
    const s = loop0(`
      void setup(){}
      void loop() {
        if (flag) { x = 1; } else { x = 0; }
      }
    `);
    expect(s.type).toBe('if');
    expect(s.then).toHaveLength(1);
    expect(s.else).toHaveLength(1);
  });

  test('condición con comparación ==', () => {
    const s = loop0(`
      void setup(){}
      void loop() { if (a == b) {} }
    `);
    expect(s.cond.op).toBe('==');
  });

  test('condición con &&', () => {
    const s = loop0(`
      void setup(){}
      void loop() { if (a > 0 && b < 10) {} }
    `);
    expect(s.cond).toMatchObject({ type: 'binop', op: '&&' });
  });

  test('condición con !', () => {
    const s = loop0(`
      void setup(){}
      void loop() { if (!active) {} }
    `);
    expect(s.cond).toMatchObject({ type: 'unop', op: '!' });
  });
});

// ─── Bucle for ───────────────────────────────────────────────────────────────

describe('parseArduinoCode — for', () => {
  test('for con declaración de variable', () => {
    const s = loop0(`
      void setup(){}
      void loop() {
        for (int i = 0; i < 10; i++) { delay(100); }
      }
    `);
    expect(s.type).toBe('for');
    expect(s.init).toMatchObject({ type: 'vardecl', name: 'i' });
    expect(s.cond).toMatchObject({ type: 'binop', op: '<' });
    expect(s.body).toHaveLength(1);
  });

  test('for descendente con --', () => {
    const s = loop0(`
      void setup(){}
      void loop() { for (int i = 9; i >= 0; i--) {} }
    `);
    expect(s.type).toBe('for');
    expect(s.update).toMatchObject({ type: 'unop' });
  });
});

// ─── Bucle while ─────────────────────────────────────────────────────────────

describe('parseArduinoCode — while', () => {
  test('while con condición booleana', () => {
    const s = loop0(`
      void setup(){}
      void loop() { while (running) { delay(10); } }
    `);
    expect(s.type).toBe('while');
    expect(s.cond).toMatchObject({ type: 'ident', name: 'running' });
    expect(s.body).toHaveLength(1);
  });

  test('while con condición comparada', () => {
    const s = loop0(`
      void setup(){}
      void loop() { while (count < 100) { count++; } }
    `);
    expect(s.cond).toMatchObject({ type: 'binop', op: '<' });
  });
});

// ─── Comentarios ─────────────────────────────────────────────────────────────

describe('parseArduinoCode — comentarios', () => {
  test('comentario de línea en setup', () => {
    const s = setup0(`
      void setup() { // encender LED
        pinMode(13, OUTPUT);
      }
      void loop() {}
    `);
    expect(s.type).toBe('comment');
    expect(s.text).toBe('encender LED');
  });

  test('comentario de bloque es ignorado (no genera nodo)', () => {
    const ast = parse(`
      /* Este es un comentario de bloque */
      void setup() { pinMode(13, OUTPUT); }
      void loop() {}
    `);
    const hasBlockComment = ast.setup.some(s => s.type === 'comment' && s.text.includes('bloque'));
    expect(hasBlockComment).toBe(false);
    expect(ast.setup[0].type).toBe('exprStmt');
  });
});

// ─── Expresiones aritméticas ──────────────────────────────────────────────────

describe('parseArduinoCode — expresiones aritméticas', () => {
  test('suma de dos números', () => {
    const s = loop0('void setup(){} void loop() { int r = 3 + 4; }');
    expect(s.value).toMatchObject({ type: 'binop', op: '+' });
    expect(s.value.left).toMatchObject({ type: 'num', value: 3 });
    expect(s.value.right).toMatchObject({ type: 'num', value: 4 });
  });

  test('multiplicación tiene mayor precedencia que suma', () => {
    const s = loop0('void setup(){} void loop() { int r = 2 + 3 * 4; }');
    // debe ser: 2 + (3 * 4)
    expect(s.value.op).toBe('+');
    expect(s.value.right.op).toBe('*');
  });

  test('map()', () => {
    const s = loop0('void setup(){} void loop() { int r = map(val, 0, 1023, 0, 255); }');
    expect(s.value.type).toBe('call');
    expect(s.value.name).toBe('map');
    expect(s.value.args).toHaveLength(5);
  });

  test('constrain()', () => {
    const s = loop0('void setup(){} void loop() { int r = constrain(v, 0, 100); }');
    expect(s.value.name).toBe('constrain');
    expect(s.value.args).toHaveLength(3);
  });

  test('millis()', () => {
    const s = loop0('void setup(){} void loop() { long t = millis(); }');
    expect(s.value).toMatchObject({ type: 'call', name: 'millis' });
  });

  test('analogRead()', () => {
    const s = loop0('void setup(){} void loop() { int v = analogRead(A0); }');
    expect(s.value).toMatchObject({ type: 'call', name: 'analogRead' });
  });

  test('digitalRead()', () => {
    const s = loop0('void setup(){} void loop() { int b = digitalRead(2); }');
    expect(s.value).toMatchObject({ type: 'call', name: 'digitalRead' });
  });
});

// ─── Funciones personalizadas ─────────────────────────────────────────────────

describe('parseArduinoCode — funciones personalizadas', () => {
  test('función void sin parámetros', () => {
    const ast = parse(`
      void setup() {}
      void loop() {}
      void blink() { digitalWrite(13, HIGH); delay(500); }
    `);
    expect(ast.functions).toHaveLength(1);
    expect(ast.functions[0].name).toBe('blink');
    expect(ast.functions[0].retType).toBe('void');
    expect(ast.functions[0].body).toHaveLength(2);
  });

  test('función int con parámetros', () => {
    const ast = parse(`
      void setup() {}
      void loop() {}
      int suma(int a, int b) { return a + b; }
    `);
    expect(ast.functions[0].retType).toBe('int');
    expect(ast.functions[0].name).toBe('suma');
  });

  test('return con valor', () => {
    const ast = parse(`
      void setup() {}
      void loop() {}
      int doble(int x) { return x * 2; }
    `);
    const ret = ast.functions[0].body[0];
    expect(ret.type).toBe('return');
    expect(ret.value.type).toBe('binop');
    expect(ret.value.op).toBe('*');
  });
});

// ─── Robustez ─────────────────────────────────────────────────────────────────

describe('parseArduinoCode — robustez', () => {
  test('código vacío no lanza excepción', () => {
    expect(() => parse('')).not.toThrow();
  });

  test('código con solo comentarios no lanza excepción', () => {
    expect(() => parse('// solo un comentario')).not.toThrow();
  });

  test('múltiples includes', () => {
    const ast = parse(`
      #include <Wire.h>
      #include <SPI.h>
      #include <DHT.h>
      void setup(){}
      void loop(){}
    `);
    expect(ast.includes).toHaveLength(3);
  });

  test('sketch completo no lanza excepción', () => {
    const code = `
      #include <Servo.h>
      int ledPin = 13;
      Servo myServo;
      void setup() {
        pinMode(ledPin, OUTPUT);
        Serial.begin(9600);
        myServo.attach(9);
      }
      void loop() {
        digitalWrite(ledPin, HIGH);
        delay(1000);
        digitalWrite(ledPin, LOW);
        delay(1000);
      }
    `;
    expect(() => parse(code)).not.toThrow();
    const ast = parse(code);
    expect(ast.includes).toContain('Servo');
    expect(ast.setup).toHaveLength(3);
    expect(ast.loop).toHaveLength(4);
  });
});
