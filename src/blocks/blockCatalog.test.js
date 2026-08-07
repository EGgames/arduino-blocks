import * as Blockly from 'blockly';
import { blocks as builtinBlocks } from 'blockly/blocks';
import { defineArduinoBlocks, nameFieldValidator, referenceFieldValidator, pinFieldValidator, RESERVED_WORDS } from './arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from './arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators } from './kidsBlocks';
import { toolboxConfig, kidsToolboxConfig } from './toolbox';
import { LIBRARY_BLOCKS, registerLibraryBlocks, buildLibraryToolboxCategory } from './libraryBlocks';
import { ARDUINO_LIBRARIES } from '../data/arduinoLibraries';
import { BLOCK_DESCRIPTIONS, KIDS_BLOCK_DESCRIPTIONS } from './blockDescriptions';

// ──────────────────────────────────────────────────────────────────────────────
// Inicialización única de Blockly headless
// ──────────────────────────────────────────────────────────────────────────────

Blockly.common.defineBlocks(builtinBlocks);
defineArduinoBlocks();
registerArduinoGenerators(arduinoGenerator);
defineKidsBlocks();
registerKidsGenerators(arduinoGenerator);
for (const lib of Object.keys(LIBRARY_BLOCKS)) {
  registerLibraryBlocks(lib, arduinoGenerator);
}

/** Recorre recursivamente los tipos de bloque de una config de toolbox */
function collectTypes(config) {
  const types = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (item.kind === 'block' && item.type) types.push(item.type);
      if (item.contents) walk(item.contents);
    }
  };
  walk(config.contents);
  return types;
}

/** Crea un bloque suelto en un workspace headless */
function makeBlock(ws, type, fields = {}) {
  const block = ws.newBlock(type);
  for (const [name, value] of Object.entries(fields)) {
    block.setFieldValue(String(value), name);
  }
  return block;
}

/** Código generado por un bloque suelto (string, tanto sentencia como expresión) */
function codeOf(ws, type, fields) {
  const block = makeBlock(ws, type, fields);
  const code = arduinoGenerator.blockToCode(block);
  return Array.isArray(code) ? code[0] : code;
}

let ws;
beforeEach(() => { ws = new Blockly.Workspace(); });
afterEach(() => { ws.dispose(); });

// ──────────────────────────────────────────────────────────────────────────────

describe('Catálogo de bloques — coherencia toolbox / definiciones / generadores', () => {
  const advancedTypes = [...new Set(collectTypes(toolboxConfig))];
  const kidsTypes = [...new Set(collectTypes(kidsToolboxConfig))];

  test('el toolbox avanzado tiene bloques en todas las categorías', () => {
    expect(toolboxConfig.kind).toBe('categoryToolbox');
    expect(toolboxConfig.contents.length).toBeGreaterThanOrEqual(10);
    for (const cat of toolboxConfig.contents) {
      expect(cat.contents.length).toBeGreaterThan(0);
    }
  });

  test.each(advancedTypes)('%s está definido en Blockly', (type) => {
    expect(Blockly.Blocks[type]).toBeDefined();
  });

  test.each(advancedTypes)('%s tiene generador de código Arduino', (type) => {
    expect(typeof arduinoGenerator.forBlock[type]).toBe('function');
  });

  test.each(kidsTypes)('modo Niño: %s está definido y tiene generador', (type) => {
    expect(Blockly.Blocks[type]).toBeDefined();
    expect(typeof arduinoGenerator.forBlock[type]).toBe('function');
  });

  test.each(advancedTypes)('%s se instancia y genera código C++ sin lanzar', (type) => {
    const code = codeOf(ws, type);
    expect(typeof code).toBe('string');
  });

  test.each(kidsTypes)('modo Niño: %s se instancia y genera código sin lanzar', (type) => {
    const code = codeOf(ws, type);
    expect(typeof code).toBe('string');
  });

  test('todo bloque del toolbox avanzado tiene descripción educativa', () => {
    const missing = advancedTypes.filter(
      (t) => !BLOCK_DESCRIPTIONS[t] && !t.startsWith('math_') && !t.startsWith('logic_') && t !== 'text',
    );
    expect(missing).toEqual([]);
  });

  test('todo bloque del toolbox kids tiene descripción educativa', () => {
    const missing = kidsTypes.filter(
      (t) => !KIDS_BLOCK_DESCRIPTIONS[t] && !BLOCK_DESCRIPTIONS[t] &&
        !t.startsWith('math_') && !t.startsWith('logic_') && t !== 'text',
    );
    expect(missing).toEqual([]);
  });
});

describe('Bloques de pines — aceptan variables en el hueco del pin', () => {
  test('digitalWrite con pin y estado por defecto', () => {
    expect(codeOf(ws, 'arduino_digital_write')).toBe('digitalWrite(13, HIGH);\n');
  });

  test('digitalWrite con una variable enchufada en el pin', () => {
    const block = makeBlock(ws, 'arduino_digital_write');
    const variable = makeBlock(ws, 'arduino_variable_get', { NAME: 'ledPin' });
    block.getInput('PIN').connection.connect(variable.outputConnection);
    expect(arduinoGenerator.blockToCode(block)).toBe('digitalWrite(ledPin, HIGH);\n');
  });

  test('digitalWrite con estado LOW enchufado', () => {
    const block = makeBlock(ws, 'arduino_digital_write');
    const state = makeBlock(ws, 'arduino_digital_state', { STATE: 'LOW' });
    block.getInput('VALUE').connection.connect(state.outputConnection);
    expect(arduinoGenerator.blockToCode(block)).toBe('digitalWrite(13, LOW);\n');
  });

  test('pinMode acepta una constante como pin', () => {
    const block = makeBlock(ws, 'arduino_pin_mode', { MODE: 'INPUT_PULLUP' });
    const variable = makeBlock(ws, 'arduino_variable_get', { NAME: 'BOTON' });
    block.getInput('PIN').connection.connect(variable.outputConnection);
    expect(arduinoGenerator.blockToCode(block)).toBe('pinMode(BOTON, INPUT_PULLUP);\n');
  });

  test('analogRead usa el bloque de pin analógico', () => {
    const block = makeBlock(ws, 'arduino_analog_read');
    const pin = makeBlock(ws, 'arduino_analog_pin', { PIN: 'A3' });
    block.getInput('PIN').connection.connect(pin.outputConnection);
    expect(arduinoGenerator.blockToCode(block)[0]).toBe('analogRead(A3)');
  });

  test('analogRead admite una variable como pin', () => {
    const block = makeBlock(ws, 'arduino_analog_read');
    const variable = makeBlock(ws, 'arduino_variable_get', { NAME: 'sensorPin' });
    block.getInput('PIN').connection.connect(variable.outputConnection);
    expect(arduinoGenerator.blockToCode(block)[0]).toBe('analogRead(sensorPin)');
  });

  test('digitalRead, analogWrite, tone y noTone usan valores por defecto', () => {
    expect(codeOf(ws, 'arduino_digital_read')).toBe('digitalRead(2)');
    expect(codeOf(ws, 'arduino_analog_write')).toBe('analogWrite(9, 0);\n');
    expect(codeOf(ws, 'arduino_tone')).toBe('tone(8, 440);\n');
    expect(codeOf(ws, 'arduino_no_tone')).toBe('noTone(8);\n');
    expect(codeOf(ws, 'arduino_tone_duration')).toBe('tone(8, 440, 500);\n');
  });

  test('el bucle for acepta variables como límites', () => {
    const block = makeBlock(ws, 'arduino_for', { VAR: 'i' });
    const limit = makeBlock(ws, 'arduino_variable_get', { NAME: 'total' });
    block.getInput('TO').connection.connect(limit.outputConnection);
    expect(arduinoGenerator.blockToCode(block))
      .toBe('for (int i = 0; i <= total; i += 1) {\n}\n');
  });

  test('el bucle for con paso negativo cuenta hacia atrás', () => {
    const block = makeBlock(ws, 'arduino_for', { VAR: 'i' });
    const step = makeBlock(ws, 'math_number', { NUM: -1 });
    block.getInput('STEP').connection.connect(step.outputConnection);
    expect(arduinoGenerator.blockToCode(block)).toContain('i >= 10; i += -1');
  });
});

describe('Bloques nuevos de E/S avanzada', () => {
  test('pulseIn', () => {
    expect(codeOf(ws, 'arduino_pulse_in', { STATE: 'HIGH' })).toBe('pulseIn(7, HIGH)');
  });
  test('shiftOut y shiftIn', () => {
    expect(codeOf(ws, 'arduino_shift_out', { ORDER: 'MSBFIRST' }))
      .toBe('shiftOut(11, 12, MSBFIRST, 0);\n');
    expect(codeOf(ws, 'arduino_shift_in', { ORDER: 'LSBFIRST' }))
      .toBe('shiftIn(11, 12, LSBFIRST)');
  });
  test('analogReference', () => {
    expect(codeOf(ws, 'arduino_analog_reference', { REF: 'INTERNAL' }))
      .toBe('analogReference(INTERNAL);\n');
  });
  test('attachInterrupt usa digitalPinToInterrupt', () => {
    expect(codeOf(ws, 'arduino_attach_interrupt', { ISR: 'contar', MODE: 'RISING' }))
      .toBe('attachInterrupt(digitalPinToInterrupt(2), contar, RISING);\n');
  });
  test('detachInterrupt e interrupts/noInterrupts', () => {
    expect(codeOf(ws, 'arduino_detach_interrupt')).toBe('detachInterrupt(digitalPinToInterrupt(2));\n');
    expect(codeOf(ws, 'arduino_interrupts_toggle', { ACTION: 'noInterrupts' })).toBe('noInterrupts();\n');
  });
});

describe('Bloques nuevos de Serial', () => {
  test('print con base numérica', () => {
    expect(codeOf(ws, 'arduino_serial_print_base', { MODE: 'println', BASE: 'HEX' }))
      .toBe('Serial.println(0, HEX);\n');
  });
  test('println vacío, write, flush y end', () => {
    expect(codeOf(ws, 'arduino_serial_println_empty')).toBe('Serial.println();\n');
    expect(codeOf(ws, 'arduino_serial_write')).toBe('Serial.write(0);\n');
    expect(codeOf(ws, 'arduino_serial_action', { ACTION: 'flush' })).toBe('Serial.flush();\n');
    expect(codeOf(ws, 'arduino_serial_action', { ACTION: 'end' })).toBe('Serial.end();\n');
  });
  test('lecturas con valor de retorno', () => {
    expect(codeOf(ws, 'arduino_serial_read_value', { FN: 'parseInt' })).toBe('Serial.parseInt()');
    expect(codeOf(ws, 'arduino_serial_read_value', { FN: 'readString' })).toBe('Serial.readString()');
    expect(codeOf(ws, 'arduino_serial_read_string_until')).toBe("Serial.readStringUntil('\\n')");
  });
});

describe('Bloques nuevos de matemáticas, bits y conversión', () => {
  test('min / max', () => {
    expect(codeOf(ws, 'arduino_min_max', { FN: 'max' })).toBe('max(0, 0)');
  });
  test('random y randomSeed', () => {
    expect(codeOf(ws, 'arduino_random')).toBe('random(0, 100)');
    expect(codeOf(ws, 'arduino_random_seed')).toBe('randomSeed(analogRead(A0));\n');
  });
  test('operaciones de bits', () => {
    expect(codeOf(ws, 'arduino_bit_read')).toBe('bitRead(0, 0)');
    expect(codeOf(ws, 'arduino_bit_write', { NAME: 'flags' })).toBe('bitWrite(flags, 0, 1);\n');
    expect(codeOf(ws, 'arduino_bit_set_clear', { FN: 'bitClear', NAME: 'flags' }))
      .toBe('bitClear(flags, 0);\n');
    expect(codeOf(ws, 'arduino_bit')).toBe('bit(0)');
    expect(codeOf(ws, 'arduino_byte_part', { FN: 'highByte' })).toBe('highByte(0)');
  });
  test('cast y sizeof', () => {
    expect(codeOf(ws, 'arduino_cast', { TYPE: 'float' })).toBe('(float)(0)');
    expect(codeOf(ws, 'arduino_sizeof', { NAME: 'datos' })).toBe('sizeof(datos)');
  });
  test('operador ternario', () => {
    expect(codeOf(ws, 'arduino_ternary')).toBe('(false ? 0 : 0)');
  });
});

describe('Bloques nuevos de variables y texto', () => {
  test('asignación compuesta e incremento', () => {
    expect(codeOf(ws, 'arduino_compound_assign', { NAME: 'contador', OP: '+=' }))
      .toBe('contador += 1;\n');
    expect(codeOf(ws, 'arduino_increment', { NAME: 'i', OP: '--' })).toBe('i--;\n');
  });

  test('carácter literal escapa comillas y barras', () => {
    expect(codeOf(ws, 'arduino_char', { CHAR: 'Z' })).toBe("'Z'");
    expect(codeOf(ws, 'arduino_char', { CHAR: '\\' })).toBe("'\\\\'");
    expect(codeOf(ws, 'arduino_char', { CHAR: "'" })).toBe("'\\''");
  });

  test('funciones de String', () => {
    expect(codeOf(ws, 'arduino_string_cast')).toBe('String(0)');
    expect(codeOf(ws, 'arduino_string_length')).toBe('"".length()');
    expect(codeOf(ws, 'arduino_string_concat')).toBe('String("") + String("")');
    expect(codeOf(ws, 'arduino_string_substring')).toBe('"".substring(0, 1)');
    expect(codeOf(ws, 'arduino_string_index_of')).toBe('"".indexOf("")');
    expect(codeOf(ws, 'arduino_string_char_at')).toBe('"".charAt(0)');
    expect(codeOf(ws, 'arduino_string_to_number', { FN: 'toFloat' })).toBe('"".toFloat()');
    expect(codeOf(ws, 'arduino_string_transform', { FN: 'trim' })).toBe('"".trim();\n');
    expect(codeOf(ws, 'arduino_string_compare', { FN: 'startsWith' })).toBe('"".startsWith("")');
    expect(codeOf(ws, 'arduino_char_check', { FN: 'isAlpha' })).toBe("isAlpha(' ')");
  });

  test('código libre como sentencia y como expresión', () => {
    expect(codeOf(ws, 'arduino_raw_statement', { CODE: 'Serial.begin(9600)' }))
      .toBe('Serial.begin(9600);\n');
    expect(codeOf(ws, 'arduino_raw_statement', { CODE: 'x = 1;' })).toBe('x = 1;\n');
    expect(codeOf(ws, 'arduino_raw_expression', { CODE: 'analogRead(A1);' })).toBe('analogRead(A1)');
  });

  test('comentario de bloque', () => {
    expect(codeOf(ws, 'arduino_block_comment', { TEXT: 'nota' })).toBe('/* nota */\n');
  });
});

describe('Validadores de nombres de variable', () => {
  test('acepta identificadores válidos', () => {
    expect(nameFieldValidator('miVariable')).toBe('miVariable');
    expect(nameFieldValidator('  contador2  ')).toBe('contador2');
  });

  test('sanea caracteres no válidos en C', () => {
    expect(nameFieldValidator('mi variable')).toBe('mi_variable');
    expect(nameFieldValidator('temp-max')).toBe('temp_max');
    expect(nameFieldValidator('2rapido')).toBe('_2rapido');
  });

  test('rechaza vacíos y palabras reservadas', () => {
    expect(nameFieldValidator('')).toBeNull();
    expect(nameFieldValidator('   ')).toBeNull();
    expect(nameFieldValidator('int')).toBeNull();
    expect(nameFieldValidator('return')).toBeNull();
    expect(RESERVED_WORDS.has('while')).toBe(true);
  });

  test('las referencias permiten miembros y ámbitos', () => {
    expect(referenceFieldValidator('sensor.valor')).toBe('sensor.valor');
    expect(referenceFieldValidator('Wire::read')).toBe('Wire::read');
    expect(referenceFieldValidator('datos[0]')).toBe('datos[0]');
    expect(referenceFieldValidator('con espacio')).toBe('con_espacio');
    expect(referenceFieldValidator('')).toBeNull();
  });

  test('el validador de pines admite números y nombres', () => {
    expect(pinFieldValidator('13')).toBe('13');
    expect(pinFieldValidator('')).toBe('13');
    expect(pinFieldValidator('LED_PIN')).toBe('LED_PIN');
    expect(pinFieldValidator('99')).toBeNull();
    expect(pinFieldValidator('!!')).toBeNull();
  });

  test('el campo NAME de un bloque de variable rechaza palabras reservadas', () => {
    const block = makeBlock(ws, 'arduino_variable_declare');
    block.setFieldValue('temperatura', 'NAME');
    expect(block.getFieldValue('NAME')).toBe('temperatura');
    block.setFieldValue('float', 'NAME');
    expect(block.getFieldValue('NAME')).toBe('temperatura');
  });
});

describe('Cobertura de librerías', () => {
  test('todas las librerías del catálogo tienen bloques propios', () => {
    const sinBloques = ARDUINO_LIBRARIES.filter((lib) => !LIBRARY_BLOCKS[lib.name]);
    expect(sinBloques.map((l) => l.name)).toEqual([]);
  });

  test('cada librería produce una categoría de toolbox con contenido', () => {
    for (const lib of ARDUINO_LIBRARIES) {
      const cat = buildLibraryToolboxCategory(lib.name);
      expect(cat).not.toBeNull();
      expect(cat.kind).toBe('category');
      expect(cat.name).toContain(lib.name);
      expect(cat.contents.length).toBeGreaterThan(0);
    }
  });

  const allLibBlocks = Object.entries(LIBRARY_BLOCKS).flatMap(([lib, def]) =>
    def.blocks.map((b) => [lib, b.type]),
  );

  test.each(allLibBlocks)('%s: el bloque %s genera código C++', (_lib, type) => {
    const code = codeOf(ws, type);
    expect(typeof code).toBe('string');
    expect(code.length).toBeGreaterThan(0);
  });

  test('los identificadores de bloque de librería son únicos', () => {
    const types = allLibBlocks.map(([, t]) => t);
    expect(new Set(types).size).toBe(types.length);
  });

  test('cada librería declara al menos un objeto global o una sentencia', () => {
    for (const [lib, def] of Object.entries(LIBRARY_BLOCKS)) {
      expect(def.blocks.length).toBeGreaterThan(0);
      expect(typeof def.colour).toBe('number');
      expect(typeof def.emoji).toBe('string');
      expect(lib).not.toBe('');
    }
  });
});
