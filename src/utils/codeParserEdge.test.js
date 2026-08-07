import { parseArduinoCode } from './codeParser';

const sketch = (setup = '', loop = '') => `void setup() {\n${setup}\n}\nvoid loop() {\n${loop}\n}`;
const parse = (code) => parseArduinoCode(code);

describe('codeParser — tokenizador', () => {
  test('reconoce números hexadecimales', () => {
    const ast = parse(sketch('', '  Wire.beginTransmission(0x3C);'));
    expect(ast.loop[0].expr.args[0].value).toBe(0x3c);
  });

  test('acepta sufijos L, U y F en los números', () => {
    const ast = parse(sketch('', '  x = 100UL;\n  y = 2.5f;'));
    expect(ast.loop[0].expr.value.value).toBe(100);
    expect(ast.loop[1].expr.value.value).toBe(2.5);
  });

  test('descarta comentarios de bloque y conserva los de línea', () => {
    const ast = parse(sketch('  /* esto se ignora */\n  // esto no', ''));
    expect(ast.setup).toHaveLength(1);
    expect(ast.setup[0]).toEqual({ type: 'comment', text: 'esto no' });
  });

  test('procesa cadenas con comillas escapadas', () => {
    const ast = parse(sketch('', '  Serial.println("di \\"hola\\"");'));
    expect(ast.loop[0].expr.args[0].type).toBe('str');
  });

  test('ignora caracteres desconocidos', () => {
    expect(parse(sketch('', '  x = 1; @ $')).error).toBeNull();
  });

  test('captura includes con comillas y con ángulos', () => {
    const ast = parse('#include <Wire.h>\n#include "MiLib.h"\n' + sketch());
    expect(ast.includes).toEqual(['Wire', 'MiLib']);
  });

  test('ignora directivas de preprocesador no soportadas', () => {
    const ast = parse('#ifndef X\n#endif\n' + sketch());
    expect(ast.error).toBeNull();
  });

  test('un #define sin valor se registra igualmente', () => {
    const ast = parse('#define DEBUG\n' + sketch());
    expect(ast.globals).toContainEqual({ type: 'define', name: 'DEBUG', value: '' });
  });
});

describe('codeParser — declaraciones globales', () => {
  test('array global con valores iniciales', () => {
    const ast = parse('int notas[] = {262, 294, 330};\n' + sketch());
    const arr = ast.globals.find((g) => g.type === 'arraydecl');
    expect(arr.name).toBe('notas');
    expect(arr.items).toHaveLength(3);
  });

  test('array global con tamaño explícito', () => {
    const ast = parse('byte buffer[16];\n' + sketch());
    const arr = ast.globals.find((g) => g.type === 'arraydecl');
    expect(arr.size.value).toBe(16);
  });

  test('tipos compuestos unsigned y const', () => {
    const ast = parse('unsigned long tiempo = 0;\nconst int MAX = 10;\n' + sketch());
    const tipos = ast.globals.filter((g) => g.type === 'vardecl').map((g) => g.varType);
    expect(tipos).toContain('unsigned long');
    expect(tipos).toContain('const int');
  });

  test('un comentario de nivel superior se conserva', () => {
    const ast = parse('// cabecera del sketch\n' + sketch());
    expect(ast.globals).toContainEqual({ type: 'comment', text: 'cabecera del sketch' });
  });

  test('una declaración incompleta se salta sin romper el resto', () => {
    const ast = parse('int ;\n' + sketch('  delay(1);', ''));
    expect(ast.error).toBeNull();
    expect(ast.setup).toHaveLength(1);
  });

  test('un prototipo de función sin cuerpo se ignora', () => {
    const ast = parse('int suma(int a, int b);\n' + sketch());
    expect(ast.functions).toHaveLength(0);
  });
});

describe('codeParser — sentencias', () => {
  test('declaración local de array', () => {
    const ast = parse(sketch('  int datos[3] = {1, 2, 3};'));
    expect(ast.setup[0].type).toBe('arraydecl');
    expect(ast.setup[0].items).toHaveLength(3);
  });

  test('declaración local de array sin inicializar', () => {
    const ast = parse(sketch('  int datos[4];'));
    expect(ast.setup[0].type).toBe('arraydecl');
    expect(ast.setup[0].size.value).toBe(4);
  });

  test('if / else if / else encadenados', () => {
    const ast = parse(sketch('', '  if (a) { x(); } else if (b) { y(); } else { z(); }'));
    expect(ast.loop[0].type).toBe('if');
    expect(ast.loop[0].else[0].type).toBe('if');
  });

  test('if sin llaves', () => {
    const ast = parse(sketch('', '  if (a) delay(1);'));
    expect(ast.loop[0].then).toHaveLength(1);
  });

  test('for con secciones vacías', () => {
    const ast = parse(sketch('', '  for (;;) { delay(1); }'));
    expect(ast.loop[0].type).toBe('for');
    expect(ast.loop[0].init).toBeNull();
  });

  test('return con y sin valor', () => {
    const ast = parse('int f() {\n  return 1;\n}\nvoid g() {\n  return;\n}\n' + sketch());
    expect(ast.functions[0].body[0].value.value).toBe(1);
    expect(ast.functions[1].body[0].value).toBeNull();
  });

  test('break y continue sueltos se ignoran como sentencia', () => {
    const ast = parse(sketch('', '  while (a) { break; continue; }'));
    expect(ast.loop[0].body).toHaveLength(0);
  });

  test('switch con case sin break y default', () => {
    const ast = parse(sketch('', '  switch (x) {\n    case 1:\n      a();\n    default:\n      b();\n  }'));
    expect(ast.loop[0].type).toBe('switch');
    expect(ast.loop[0].cases).toHaveLength(1);
    expect(ast.loop[0].defaultBody).toHaveLength(1);
  });

  test('switch con contenido inesperado no rompe el parseo', () => {
    const ast = parse(sketch('', '  switch (x) { 42 }'));
    expect(ast.loop[0].type).toBe('switch');
  });

  test('acceso a elementos de array en expresiones', () => {
    const ast = parse(sketch('', '  x = datos[2];'));
    expect(ast.loop[0].expr.value.name).toBe('datos');
  });

  test('asignaciones compuestas', () => {
    const ast = parse(sketch('', '  x += 1;\n  y *= 2;\n  z %= 3;'));
    expect(ast.loop.map((s) => s.expr.op)).toEqual(['+=', '*=', '%=']);
  });

  test('incremento prefijo y sufijo', () => {
    const ast = parse(sketch('', '  ++i;\n  j++;\n  --k;\n  m--;'));
    expect(ast.loop.map((s) => s.expr.op)).toEqual(['++pre', '++post', '--pre', '--post']);
  });

  test('operadores bit a bit con su precedencia', () => {
    const ast = parse(sketch('', '  x = a | b & c ^ d;'));
    expect(ast.loop[0].expr.value.op).toBe('|');
  });

  test('desplazamientos de bits', () => {
    const ast = parse(sketch('', '  x = 1 << 3;\n  y = 8 >> 2;'));
    expect(ast.loop[0].expr.value.op).toBe('<<');
    expect(ast.loop[1].expr.value.op).toBe('>>');
  });

  test('negación de bits', () => {
    const ast = parse(sketch('', '  x = ~mascara;'));
    expect(ast.loop[0].expr.value.op).toBe('~');
  });

  test('expresiones entre paréntesis', () => {
    const ast = parse(sketch('', '  x = (a + b) * c;'));
    expect(ast.loop[0].expr.value.op).toBe('*');
  });

  test('llamada sin argumentos y con varios', () => {
    const ast = parse(sketch('', '  a();\n  b(1, 2, 3);'));
    expect(ast.loop[0].expr.args).toHaveLength(0);
    expect(ast.loop[1].expr.args).toHaveLength(3);
  });

  test('acceso a miembros encadenados', () => {
    const ast = parse(sketch('', '  a.b.c();'));
    expect(ast.loop[0].expr.name).toBe('a.b.c');
  });

  test('un sketch vacío devuelve listas vacías', () => {
    const ast = parse('');
    expect(ast.setup).toEqual([]);
    expect(ast.loop).toEqual([]);
    expect(ast.error).toBeNull();
  });

  test('sentencias sueltas fuera de una función se ignoran', () => {
    expect(parse('esto no es codigo valido\n' + sketch()).error).toBeNull();
  });

  test('un punto y coma suelto no genera sentencia', () => {
    const ast = parse(sketch('  ;;'));
    expect(ast.setup).toHaveLength(0);
  });

  test('una entrada nula devuelve un AST con error en vez de lanzar', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const ast = parseArduinoCode(null);
    expect(ast.error).toBeTruthy();
    expect(ast.setup).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
