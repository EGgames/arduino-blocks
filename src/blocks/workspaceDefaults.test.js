import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import { defineArduinoBlocks } from './arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from './arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators } from './kidsBlocks';

// ──────────────────────────────────────────────────────────────────────────────
// Rutas de respaldo de workspaceToCode: bloques con campos vacíos y bloques
// declarativos anidados dentro de una función (en lugar de flotantes).
// ──────────────────────────────────────────────────────────────────────────────

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

/** Hace que el bloque devuelva null en todos sus campos */
function vaciarCampos(block) {
  block.getFieldValue = () => null;
  return block;
}

describe('workspaceToCode con campos vacíos', () => {
  test('cada declaración global cae en su valor por defecto', () => {
    add('arduino_setup_loop');
    vaciarCampos(add('arduino_define'));
    vaciarCampos(add('arduino_include'));
    vaciarCampos(add('arduino_global_variable_declare'));
    vaciarCampos(add('arduino_const_define'));
    vaciarCampos(add('arduino_array_declare'));
    vaciarCampos(add('arduino_array_declare_init'));
    vaciarCampos(add('arduino_struct_define'));
    vaciarCampos(add('arduino_enum_define'));

    const code = arduinoGenerator.workspaceToCode(ws);
    expect(code).toContain('#define MI_DEFINE');
    expect(code).toContain('#include <Wire.h>');
    expect(code).toContain('int globalVar = 0;');
    expect(code).toContain('const int MY_CONST = 0;');
    expect(code).toContain('int miArray[10];');
    expect(code).toContain('int miArray[] = {};');
    expect(code).toContain('struct MiStruct {  };');
    expect(code).toContain('enum MiEnum {  };');
  });

  test('el bloque de función sin campos usa nombre y tipo por defecto', () => {
    add('arduino_setup_loop');
    vaciarCampos(add('arduino_function_define'));
    expect(arduinoGenerator.workspaceToCode(ws)).toContain('void miFuncion() {');
  });

  test('el NeoPixel del modo Niño sin campos usa pin y cantidad por defecto', () => {
    add('kids_setup_loop');
    vaciarCampos(add('kids_neopixel_setup'));
    expect(arduinoGenerator.workspaceToCode(ws))
      .toContain('Adafruit_NeoPixel strip(8, 6, NEO_GRB + NEO_KHZ800);');
  });

  test('un #define con valor genera la macro completa', () => {
    add('arduino_setup_loop');
    add('arduino_define', { NAME: 'LED', VALUE: '13' });
    expect(arduinoGenerator.workspaceToCode(ws)).toContain('#define LED 13');
  });
});

describe('Declaraciones anidadas dentro de una función', () => {
  test('los arrays anidados los emite el generador del bloque, no la pasada global', () => {
    const sl = add('arduino_setup_loop');
    const arr = add('arduino_array_declare', { TYPE: 'byte', NAME: 'buffer', SIZE: 8 });
    const arrInit = add('arduino_array_declare_init', { TYPE: 'int', NAME: 'seq', ITEMS: '1, 2' });
    sl.getInput('SETUP').connection.connect(arr.previousConnection);
    arr.nextConnection.connect(arrInit.previousConnection);

    const code = arduinoGenerator.workspaceToCode(ws);
    expect(code).toContain('  byte buffer[8];');
    expect(code).toContain('  int seq[] = {1, 2};');
    // No deben aparecer también como globales
    expect(code.indexOf('byte buffer[8];')).toBe(code.lastIndexOf('byte buffer[8];'));
  });

  test('una constante anidada se declara dentro de la función', () => {
    const sl = add('arduino_setup_loop');
    const c = add('arduino_const_define', { TYPE: 'int', NAME: 'LOCAL' });
    sl.getInput('SETUP').connection.connect(c.previousConnection);
    const code = arduinoGenerator.workspaceToCode(ws);
    expect(code).toContain('  const int LOCAL = 0;');
  });

  test('los generadores de bloques flotantes devuelven cadena vacía', () => {
    const flotantes = [
      'arduino_array_declare', 'arduino_array_declare_init', 'arduino_const_define',
      'arduino_include', 'arduino_define', 'arduino_struct_define',
      'arduino_enum_define', 'arduino_global_variable_declare', 'arduino_setup_loop',
      'arduino_function_define', 'kids_setup_loop', 'kids_function_define',
    ];
    for (const type of flotantes) {
      const bloque = add(type);
      expect(arduinoGenerator.forBlock[type](bloque)).toBe('');
    }
  });
});
