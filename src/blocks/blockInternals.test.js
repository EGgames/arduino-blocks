import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import { defineArduinoBlocks } from './arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from './arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators, getKidsTheme, getArduinoDarkTheme } from './kidsBlocks';
import { fillTemplate, makeField, makeLibraryBlock, buildLibraryBlocksFromSpecs } from './libraryBlockFactory';
import { LIBRARY_SPECS } from './librarySpecs';
import { registerFallbackBlocks, buildFallbackLibraryToolboxCategory, buildLibraryToolboxCategory } from './libraryBlocks';

Blockly.common.defineBlocks(builtinBlocks);
defineArduinoBlocks();
registerArduinoGenerators(arduinoGenerator);
defineKidsBlocks();
registerKidsGenerators(arduinoGenerator);

let ws;
beforeEach(() => { ws = new Blockly.Workspace(); });
afterEach(() => { ws.dispose(); });

const add = (type, fields = {}) => {
  const b = ws.newBlock(type);
  for (const [k, v] of Object.entries(fields)) b.setFieldValue(String(v), k);
  return b;
};
const plug = (parent, input, child) => {
  parent.getInput(input).connection.connect(child.outputConnection);
  return parent;
};
const code = (block) => {
  const c = arduinoGenerator.blockToCode(block);
  return Array.isArray(c) ? c[0] : c;
};

describe('Temas visuales de Blockly', () => {
  test('el tema del modo Niño se crea una sola vez', () => {
    const t1 = getKidsTheme();
    const t2 = getKidsTheme();
    expect(t1).toBe(t2);
    expect(t1).toBeTruthy();
  });

  test('el tema oscuro avanzado se crea una sola vez', () => {
    const t1 = getArduinoDarkTheme();
    expect(getArduinoDarkTheme()).toBe(t1);
    expect(t1).toBeTruthy();
  });
});

describe('Validador de pines del modo Niño', () => {
  test('acepta números dentro de rango', () => {
    const b = add('kids_pin_mode');
    b.setFieldValue('7', 'PIN');
    expect(b.getFieldValue('PIN')).toBe('7');
  });

  test('acepta nombres de constante', () => {
    const b = add('kids_digital_write');
    b.setFieldValue('LED_PIN', 'PIN');
    expect(b.getFieldValue('PIN')).toBe('LED_PIN');
  });

  test('rechaza pines fuera de rango y caracteres inválidos', () => {
    const b = add('kids_pin_mode');
    b.setFieldValue('13', 'PIN');
    b.setFieldValue('99', 'PIN');
    expect(b.getFieldValue('PIN')).toBe('13');
    b.setFieldValue('!!', 'PIN');
    expect(b.getFieldValue('PIN')).toBe('13');
  });

  test('un pin vacío vuelve al 13', () => {
    const b = add('kids_analog_write');
    b.setFieldValue('', 'PIN');
    expect(b.getFieldValue('PIN')).toBe('13');
  });
});

describe('Generadores con valores conectados', () => {
  const num = (n) => add('math_number', { NUM: n });

  test('los bloques de pines usan el valor enchufado en vez del predeterminado', () => {
    const pinMode = plug(add('arduino_pin_mode', { MODE: 'INPUT' }), 'PIN', num(4));
    expect(code(pinMode)).toBe('pinMode(4, INPUT);\n');

    const aw = plug(plug(add('arduino_analog_write'), 'PIN', num(3)), 'VALUE', num(200));
    expect(code(aw)).toBe('analogWrite(3, 200);\n');

    const dr = plug(add('arduino_digital_read'), 'PIN', num(5));
    expect(code(dr)).toBe('digitalRead(5)');
  });

  test('map, constrain, min/max y random con todos sus valores', () => {
    const map = add('arduino_map');
    ['VALUE', 'FROM_LOW', 'FROM_HIGH', 'TO_LOW', 'TO_HIGH'].forEach((i, idx) => plug(map, i, num(idx)));
    expect(code(map)).toBe('map(0, 1, 2, 3, 4)');

    const con = add('arduino_constrain');
    ['VALUE', 'MIN', 'MAX'].forEach((i, idx) => plug(con, i, num(idx)));
    expect(code(con)).toBe('constrain(0, 1, 2)');

    const mm = add('arduino_min_max', { FN: 'min' });
    plug(mm, 'A', num(3)); plug(mm, 'B', num(9));
    expect(code(mm)).toBe('min(3, 9)');

    const rnd = add('arduino_random');
    plug(rnd, 'MIN', num(1)); plug(rnd, 'MAX', num(7));
    expect(code(rnd)).toBe('random(1, 7)');
  });

  test('operaciones de bits con valores', () => {
    const bw = add('arduino_bitwise', { OP: '<<' });
    plug(bw, 'A', num(1)); plug(bw, 'B', num(3));
    expect(code(bw)).toBe('(1 << 3)');

    const bnot = plug(add('arduino_bitwise_not'), 'VALUE', num(5));
    expect(code(bnot)).toBe('~(5)');

    const br = add('arduino_bit_read');
    plug(br, 'VALUE', num(8)); plug(br, 'BIT', num(3));
    expect(code(br)).toBe('bitRead(8, 3)');

    const bit = plug(add('arduino_bit'), 'N', num(4));
    expect(code(bit)).toBe('bit(4)');
  });

  test('cada operador bit a bit devuelve su precedencia', () => {
    for (const op of ['&', '|', '^', '<<', '>>']) {
      const b = add('arduino_bitwise', { OP: op });
      const [texto, orden] = arduinoGenerator.blockToCode(b);
      expect(texto).toContain(op);
      expect(typeof orden).toBe('number');
    }
  });

  test('lógica y comparación con ambos operadores', () => {
    const yy = add('arduino_logic', { OP: '&&' });
    plug(yy, 'A', add('logic_boolean', { BOOL: 'TRUE' }));
    plug(yy, 'B', add('logic_boolean', { BOOL: 'FALSE' }));
    expect(code(yy)).toBe('(true && false)');

    const oo = add('arduino_logic', { OP: '||' });
    expect(code(oo)).toBe('(false || false)');

    for (const op of ['==', '!=', '<', '<=', '>', '>=']) {
      expect(code(add('arduino_compare', { OP: op }))).toBe(`(0 ${op} 0)`);
    }
  });

  test('matemáticas integradas de Blockly', () => {
    for (const [op, esperado] of [['ADD', '+'], ['MINUS', '-'], ['MULTIPLY', '*'], ['DIVIDE', '/']]) {
      expect(code(add('math_arithmetic', { OP: op }))).toBe(`(0 ${esperado} 0)`);
    }
    expect(code(add('math_arithmetic', { OP: 'POWER' }))).toBe('pow(0, 0)');

    for (const [op, esperado] of [['ROOT', 'sqrt(0)'], ['ABS', 'abs(0)'], ['NEG', '-(0)'],
      ['LN', 'log(0)'], ['LOG10', 'log10(0)'], ['EXP', 'exp(0)'], ['POW10', 'pow(10, 0)']]) {
      expect(code(add('math_single', { OP: op }))).toBe(esperado);
    }
    expect(code(add('math_trig', { OP: 'SIN' }))).toBe('sin(0)');
    expect(code(add('logic_compare', { OP: 'NEQ' }))).toBe('(0 != 0)');
    expect(code(add('logic_operation', { OP: 'OR' }))).toBe('(false || false)');
    expect(code(add('logic_negate'))).toBe('!(false)');
    expect(code(add('logic_boolean', { BOOL: 'FALSE' }))).toBe('false');
  });

  test('el texto escapa comillas y barras invertidas', () => {
    expect(code(add('text', { TEXT: 'di "hola"\\fin' }))).toBe('"di \\"hola\\"\\\\fin"');
  });

  test('el bloque de código libre vacío no genera nada', () => {
    expect(code(add('arduino_raw_statement', { CODE: '   ' }))).toBe('');
    expect(code(add('arduino_raw_expression', { CODE: '' }))).toBe('0');
  });

  test('el código libre respeta las llaves finales', () => {
    expect(code(add('arduino_raw_statement', { CODE: 'if (x) { y(); }' }))).toBe('if (x) { y(); }\n');
  });

  test('if/else sin rama else no emite el bloque else', () => {
    expect(code(add('arduino_if'))).toBe('if (false) {\n}\n');
  });

  test('if/else-if sin else final', () => {
    expect(code(add('arduino_if_else_if'))).toBe('if (false) {\n} else if (false) {\n}\n');
  });

  test('switch sin default no emite la rama default', () => {
    expect(code(add('arduino_switch_case'))).not.toContain('default:');
  });
});

describe('Fábrica declarativa de bloques de librería', () => {
  test('fillTemplate sustituye solo los marcadores conocidos', () => {
    expect(fillTemplate('a({X}) y {Y}', { X: 1 })).toBe('a(1) y {Y}');
    expect(fillTemplate('sin marcadores', {})).toBe('sin marcadores');
    expect(fillTemplate('byte mac[] = {0xDE, 0xAD}', { X: 1 })).toBe('byte mac[] = {0xDE, 0xAD}');
  });

  test('makeField crea el tipo de campo pedido', () => {
    expect(makeField({ kind: 'num', default: 5, min: 0, max: 10 })).toBeInstanceOf(Blockly.FieldNumber);
    expect(makeField({ kind: 'num' })).toBeInstanceOf(Blockly.FieldNumber);
    expect(makeField({ kind: 'text', default: 'x' })).toBeInstanceOf(Blockly.FieldTextInput);
    expect(makeField({ kind: 'text' })).toBeInstanceOf(Blockly.FieldTextInput);
    expect(makeField({})).toBeInstanceOf(Blockly.FieldTextInput);
    expect(makeField({ kind: 'dropdown', options: [['a', 'A']] })).toBeInstanceOf(Blockly.FieldDropdown);
  });

  test('una especificación mínima produce una sentencia con punto y coma', () => {
    const def = makeLibraryBlock({ type: 'lib_prueba_min', label: 'X.hacer()', code: 'X.hacer()' }, 100);
    expect(def.isGlobal).toBe(false);
    Blockly.Blocks['lib_prueba_min'] = { init() { def.definition(this); } };
    const b = ws.newBlock('lib_prueba_min');
    expect(def.generator(b, arduinoGenerator)).toBe('X.hacer();\n');
  });

  test('una declaración global añade el punto y coma solo si falta', () => {
    const conPunto = makeLibraryBlock({ type: 'lib_g1', kind: 'global', label: 'A', code: 'A a;' }, 10);
    const sinPunto = makeLibraryBlock({ type: 'lib_g2', kind: 'global', label: 'B', code: 'B b' }, 10);
    Blockly.Blocks['lib_g1'] = { init() { conPunto.definition(this); } };
    Blockly.Blocks['lib_g2'] = { init() { sinPunto.definition(this); } };
    expect(conPunto.generator(ws.newBlock('lib_g1'), arduinoGenerator)).toBe('A a;');
    expect(sinPunto.generator(ws.newBlock('lib_g2'), arduinoGenerator)).toBe('B b;');
  });

  test('un bloque de valor devuelve [código, precedencia]', () => {
    const def = makeLibraryBlock({ type: 'lib_v1', kind: 'value', label: 'X.leer()', code: 'X.leer()' }, 10);
    Blockly.Blocks['lib_v1'] = { init() { def.definition(this); } };
    const resultado = def.generator(ws.newBlock('lib_v1'), arduinoGenerator);
    expect(resultado).toEqual(['X.leer()', 0]);
  });

  test('los huecos con valor por defecto generan sombras en el toolbox', () => {
    const def = makeLibraryBlock({
      type: 'lib_sombra', kind: 'statement', label: 'X.enviar', code: 'X.enviar({A}, {B})',
      inputs: [
        { name: 'A', default: '5' },
        { name: 'B', default: '"hola"', shadowText: true },
        { name: 'C' },
      ],
      fields: [{ name: 'F', kind: 'num', default: 2 }],
    }, 10);
    expect(def.toolbox.fields).toEqual({ F: 2 });
    expect(def.toolbox.inputs.A.shadow.type).toBe('math_number');
    expect(def.toolbox.inputs.B.shadow.type).toBe('text');
    expect(def.toolbox.inputs.B.shadow.fields.TEXT).toBe('hola');
    expect(def.toolbox.inputs.C).toBeUndefined();

    Blockly.Blocks['lib_sombra'] = { init() { def.definition(this); } };
    const b = ws.newBlock('lib_sombra');
    expect(def.generator(b, arduinoGenerator)).toBe('X.enviar(5, "hola");\n');
  });

  test('un bloque sin campos ni huecos no declara nada en el toolbox', () => {
    const def = makeLibraryBlock({ type: 'lib_vacio', label: 'X.nada()', code: 'X.nada()' }, 10);
    expect(def.toolbox).toEqual({});
  });

  test('buildLibraryBlocksFromSpecs conserva color y emoji', () => {
    const salida = buildLibraryBlocksFromSpecs({
      MiLib: { colour: 42, emoji: '🎈', blocks: [{ type: 'lib_x_y', label: 'L', code: 'l()' }] },
    });
    expect(salida.MiLib.colour).toBe(42);
    expect(salida.MiLib.emoji).toBe('🎈');
    expect(salida.MiLib.blocks).toHaveLength(1);
  });

  test('todas las especificaciones declaran tipo, etiqueta y código', () => {
    for (const [lib, def] of Object.entries(LIBRARY_SPECS)) {
      expect(typeof def.colour).toBe('number');
      expect(def.emoji.length).toBeGreaterThan(0);
      for (const spec of def.blocks) {
        expect(spec.type.startsWith('lib_')).toBe(true);
        expect(spec.label).toBeTruthy();
        expect(spec.code).toBeTruthy();
        expect(['global', 'statement', 'value', undefined]).toContain(spec.kind);
      }
      expect(lib).toBeTruthy();
    }
  });
});

describe('Categorías de toolbox de librería', () => {
  test('una librería desconocida devuelve null', () => {
    expect(buildLibraryToolboxCategory('NoExiste')).toBeNull();
  });

  test('la categoría genérica ofrece los tres bloques comodín', () => {
    const cat = buildFallbackLibraryToolboxCategory('MiLibreriaRara', arduinoGenerator);
    expect(cat.name).toContain('MiLibreriaRara');
    expect(cat.contents.map((c) => c.type)).toEqual([
      'lib_custom_global_decl', 'lib_custom_call_void', 'lib_custom_call_return',
    ]);
  });

  test('los bloques comodín generan código C++ válido', () => {
    registerFallbackBlocks(arduinoGenerator);
    const decl = add('lib_custom_global_decl', { DECL: 'MyLib obj(3)' });
    expect(arduinoGenerator.forBlock['lib_custom_global_decl'](decl)).toBe('MyLib obj(3);');

    const declConPunto = add('lib_custom_global_decl', { DECL: 'MyLib otro;' });
    expect(arduinoGenerator.forBlock['lib_custom_global_decl'](declConPunto)).toBe('MyLib otro;');

    const llamada = add('lib_custom_call_void', { CALL: 'obj.begin()' });
    expect(arduinoGenerator.forBlock['lib_custom_call_void'](llamada)).toBe('obj.begin();\n');

    const llamadaConPunto = add('lib_custom_call_void', { CALL: 'obj.stop();' });
    expect(arduinoGenerator.forBlock['lib_custom_call_void'](llamadaConPunto)).toBe('obj.stop();\n');

    const valor = add('lib_custom_call_return', { CALL: 'obj.read();' });
    expect(arduinoGenerator.forBlock['lib_custom_call_return'](valor)).toEqual(['obj.read()', 0]);
  });

  test('registrar dos veces los bloques comodín no los duplica', () => {
    const antes = arduinoGenerator.forBlock['lib_custom_call_void'];
    registerFallbackBlocks(arduinoGenerator);
    expect(arduinoGenerator.forBlock['lib_custom_call_void']).toBe(antes);
  });
});
