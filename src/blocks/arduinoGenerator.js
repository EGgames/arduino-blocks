import * as Blockly from 'blockly';

// ──────────────────────────────────────────────
// Generador de código Arduino (C++) desde Blockly
// ──────────────────────────────────────────────

export class ArduinoGenerator extends Blockly.Generator {
  constructor() {
    super('Arduino');
    this.INDENT = '  ';

    // Set de tipos de bloque de librería que generan declaraciones globales
    this._globalLibraryBlockTypes = new Set();

    // Precedencias de operadores
    this.ORDER_ATOMIC = 0;
    this.ORDER_UNARY_POSTFIX = 1;
    this.ORDER_UNARY_PREFIX = 2;
    this.ORDER_MULTIPLICATIVE = 3;
    this.ORDER_ADDITIVE = 4;
    this.ORDER_SHIFT = 5;
    this.ORDER_RELATIONAL = 6;
    this.ORDER_EQUALITY = 7;
    this.ORDER_BITWISE_AND = 8;
    this.ORDER_BITWISE_XOR = 9;
    this.ORDER_BITWISE_OR = 10;
    this.ORDER_LOGICAL_AND = 11;
    this.ORDER_LOGICAL_OR = 12;
    this.ORDER_CONDITIONAL = 13;
    this.ORDER_ASSIGNMENT = 14;
    this.ORDER_NONE = 99;
  }

  // ── Punto de entrada principal ─────────────────────────────────────────

  workspaceToCode(workspace) {
    const setupLoopBlocks   = [
      ...workspace.getBlocksByType('arduino_setup_loop'),
      ...workspace.getBlocksByType('kids_setup_loop'),
    ];
    const functionDefBlocks = [
      ...workspace.getBlocksByType('arduino_function_define'),
      ...workspace.getBlocksByType('kids_function_define'),
    ];

    if (setupLoopBlocks.length === 0 && functionDefBlocks.length === 0) {
      return '// Agrega el bloque "Setup/Loop" para comenzar\n';
    }

    // 0. #define directivas (antes de #include)
    let definesCode = '';
    for (const b of [
      ...workspace.getBlocksByType('arduino_define'),
      ...workspace.getBlocksByType('kids_define'),
    ]) {
      if (b.getSurroundParent()) continue;
      const name  = b.getFieldValue('NAME')  || 'MI_DEFINE';
      const value = b.getFieldValue('VALUE') || '';
      definesCode += value.trim() ? `#define ${name} ${value}\n` : `#define ${name}\n`;
    }
    if (definesCode) definesCode += '\n';

    // 1. #include directivas (solo bloques flotantes)
    let includesCode = '';
    for (const b of [
      ...workspace.getBlocksByType('arduino_include'),
      ...workspace.getBlocksByType('kids_include'),
    ]) {
      if (b.getSurroundParent()) continue;
      const lib = b.getFieldValue('LIB') || 'Wire';
      includesCode += `#include <${lib}.h>\n`;
    }

    // Detectar bloques NeoPixel kids → agregar include y global strip automáticamente
    const neopixelSetupBlocks = workspace.getBlocksByType('kids_neopixel_setup');
    let neopixelGlobal = '';
    if (neopixelSetupBlocks.length > 0) {
      if (!includesCode.includes('Adafruit_NeoPixel')) {
        includesCode += '#include <Adafruit_NeoPixel.h>\n';
      }
      const setupB = neopixelSetupBlocks[0];
      const pin = setupB.getFieldValue('PIN') || '6';
      const num = setupB.getFieldValue('NUM') || '8';
      neopixelGlobal = `Adafruit_NeoPixel strip(${num}, ${pin}, NEO_GRB + NEO_KHZ800);\n`;
    }

    if (includesCode) includesCode += '\n';

    // 1b. Tipos definidos por el usuario (struct / enum) — antes de las variables
    let typesCode = '';
    for (const b of workspace.getBlocksByType('arduino_struct_define')) {
      if (b.getSurroundParent()) continue;
      const name   = b.getFieldValue('NAME') || 'MiStruct';
      const fields = (b.getFieldValue('FIELDS') || '').trim();
      typesCode += `struct ${name} { ${fields} };\n`;
    }
    for (const b of workspace.getBlocksByType('arduino_enum_define')) {
      if (b.getSurroundParent()) continue;
      const name   = b.getFieldValue('NAME') || 'MiEnum';
      const values = (b.getFieldValue('VALUES') || '').trim();
      typesCode += `enum ${name} { ${values} };\n`;
    }
    if (typesCode) typesCode += '\n';

    // 2. Variables y constantes globales (solo bloques flotantes)
    let globalsCode = '';
    for (const b of [
      ...workspace.getBlocksByType('arduino_global_variable_declare'),
      ...workspace.getBlocksByType('kids_global_var'),
    ]) {
      if (b.getSurroundParent()) continue;
      const storage = (b.getFieldValue('STORAGE') || '').trim();
      const type  = b.getFieldValue('TYPE') || 'int';
      const name  = b.getFieldValue('NAME') || 'globalVar';
      const value = this.valueToCode(b, 'VALUE', this.ORDER_ASSIGNMENT) || '0';
      globalsCode += `${storage ? storage + ' ' : ''}${type} ${name} = ${value};\n`;
    }
    for (const b of [
      ...workspace.getBlocksByType('arduino_const_define'),
      ...workspace.getBlocksByType('kids_const'),
    ]) {
      if (b.getSurroundParent()) continue;
      const type  = b.getFieldValue('TYPE') || 'int';
      const name  = b.getFieldValue('NAME') || 'MY_CONST';
      const value = this.valueToCode(b, 'VALUE', this.ORDER_ASSIGNMENT) || '0';
      globalsCode += `const ${type} ${name} = ${value};\n`;
    }
    for (const b of [
      ...workspace.getBlocksByType('arduino_array_declare'),
      ...workspace.getBlocksByType('kids_array_declare'),
    ]) {
      if (b.getSurroundParent()) continue;
      const type = b.getFieldValue('TYPE') || 'int';
      const name = b.getFieldValue('NAME') || 'miArray';
      const size = b.getFieldValue('SIZE') || '10';
      globalsCode += `${type} ${name}[${size}];\n`;
    }
    for (const b of workspace.getBlocksByType('arduino_array_declare_init')) {
      if (b.getSurroundParent()) continue;
      const type  = b.getFieldValue('TYPE') || 'int';
      const name  = b.getFieldValue('NAME') || 'miArray';
      const items = (b.getFieldValue('ITEMS') || '').trim();
      globalsCode += `${type} ${name}[] = {${items}};\n`;
    }
    if (globalsCode) globalsCode += '\n';

    // 3b. Declaraciones de objetos de librería (bloques globales flotantes)
    let libGlobalsCode = '';
    for (const type of this._globalLibraryBlockTypes) {
      for (const b of workspace.getBlocksByType(type)) {
        if (b.getSurroundParent()) continue;
        const code = this.blockToCode(b);
        if (typeof code === 'string' && code.trim()) {
          libGlobalsCode += code.trim() + '\n';
        }
      }
    }
    if (libGlobalsCode) libGlobalsCode += '\n';

    // 3. Funciones personalizadas (aparecen antes de setup/loop)
    let functionsCode = '';
    for (const fb of functionDefBlocks) {
      const retType = fb.getFieldValue('RETURN_TYPE') || 'void';
      const name    = fb.getFieldValue('NAME') || 'miFuncion';
      const params  = fb.getFieldValue('PARAMS') || '';
      const body    = this.statementToCode(fb, 'BODY');
      functionsCode += `${retType} ${name}(${params}) {\n${body}}\n\n`;
    }

    // 4. setup() y loop()
    let setupCode = '';
    let loopCode  = '';
    if (setupLoopBlocks.length > 0) {
      setupCode = this.statementToCode(setupLoopBlocks[0], 'SETUP');
      loopCode  = this.statementToCode(setupLoopBlocks[0], 'LOOP');
    }

    let code = '';
    code += definesCode;
    code += includesCode;
    code += neopixelGlobal;
    code += typesCode;
    code += globalsCode;
    code += libGlobalsCode;
    code += functionsCode;
    code += 'void setup() {\n';
    code += setupCode || this.INDENT + '// setup vacío\n';
    code += '}\n\n';
    code += 'void loop() {\n';
    code += loopCode  || this.INDENT + '// loop vacío\n';
    code += '}\n';

    return code;
  }

  /** Registra un tipo de bloque de librería para ser recogido como declaración global */
  addGlobalLibraryBlockType(type) {
    this._globalLibraryBlockTypes.add(type);
  }

  // CRITICAL: override scrub_() para encadenar bloques en secuencia.
  // Sin este override, solo se generaría el PRIMER bloque de cualquier
  // cadena (setup, loop, if-body, for-body, etc.).
  scrub_(block, code, opt_thisOnly) {
    const nextBlock = block.getNextBlock();
    const nextCode  = opt_thisOnly ? '' : (nextBlock ? this.blockToCode(nextBlock) : '');
    return code + nextCode;
  }
}

const arduinoGenerator = new ArduinoGenerator();

// ──────────────────────────────────────────────
// Registrar generadores de bloques
// ──────────────────────────────────────────────
//
// REGLA DE INDENTACIÓN:
//   Los generadores NO deben agregar su propia indentación inicial.
//   statementToCode() ya llama a prefixLines(code, INDENT) que agrega
//   2 espacios a TODAS las líneas. Agregar gen.INDENT manualmente
//   causa doble indentación (4 espacios en lugar de 2).
//
//   Para bloques compuestos (if/for/while/do_while):
//     - El código de la primera línea va SIN indent.
//     - El cuerpo viene de statementToCode (ya con 2 espacios).
//     - La llave de cierre `}` va al nivel 0 en el string raw.

export function registerArduinoGenerators(gen) {
  const fb = gen.forBlock;

  /** Lee un input de valor con un valor por defecto si está vacío */
  const val = (block, name, def, order = gen.ORDER_NONE) =>
    gen.valueToCode(block, name, order) || def;

  // ── Estructura principal ───────────────────────────────────────────────

  fb['arduino_setup_loop'] = function (_block) {
    return ''; // generado directamente en workspaceToCode
  };
  fb['kids_setup_loop'] = function (_block) {
    return ''; // generado directamente en workspaceToCode (igual que arduino_setup_loop)
  };

  // ── Pines ─────────────────────────────────────────────────────────────

  fb['arduino_pin_mode'] = function (block) {
    const pin  = val(block, 'PIN', '13');
    const mode = block.getFieldValue('MODE');
    return `pinMode(${pin}, ${mode});\n`;
  };

  fb['arduino_digital_write'] = function (block) {
    const pin   = val(block, 'PIN', '13');
    const value = val(block, 'VALUE', 'HIGH');
    return `digitalWrite(${pin}, ${value});\n`;
  };

  fb['arduino_digital_state'] = function (block) {
    return [block.getFieldValue('STATE'), gen.ORDER_ATOMIC];
  };

  fb['arduino_analog_pin'] = function (block) {
    return [block.getFieldValue('PIN'), gen.ORDER_ATOMIC];
  };

  fb['arduino_digital_read'] = function (block) {
    return [`digitalRead(${val(block, 'PIN', '2')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_analog_write'] = function (block) {
    const pin   = val(block, 'PIN', '9');
    const value = val(block, 'VALUE', '0');
    return `analogWrite(${pin}, ${value});\n`;
  };

  fb['arduino_analog_read'] = function (block) {
    return [`analogRead(${val(block, 'PIN', 'A0')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_analog_reference'] = function (block) {
    return `analogReference(${block.getFieldValue('REF')});\n`;
  };

  fb['arduino_pulse_in'] = function (block) {
    const pin = val(block, 'PIN', '7');
    return [`pulseIn(${pin}, ${block.getFieldValue('STATE')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_shift_out'] = function (block) {
    const data  = val(block, 'DATA', '11');
    const clock = val(block, 'CLOCK', '12');
    const value = val(block, 'VALUE', '0');
    return `shiftOut(${data}, ${clock}, ${block.getFieldValue('ORDER')}, ${value});\n`;
  };

  fb['arduino_shift_in'] = function (block) {
    const data  = val(block, 'DATA', '11');
    const clock = val(block, 'CLOCK', '12');
    return [`shiftIn(${data}, ${clock}, ${block.getFieldValue('ORDER')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_attach_interrupt'] = function (block) {
    const pin = val(block, 'PIN', '2');
    const isr = block.getFieldValue('ISR') || 'miISR';
    return `attachInterrupt(digitalPinToInterrupt(${pin}), ${isr}, ${block.getFieldValue('MODE')});\n`;
  };

  fb['arduino_detach_interrupt'] = function (block) {
    return `detachInterrupt(digitalPinToInterrupt(${val(block, 'PIN', '2')}));\n`;
  };

  fb['arduino_interrupts_toggle'] = function (block) {
    return `${block.getFieldValue('ACTION')}();\n`;
  };

  // ── Tiempo ────────────────────────────────────────────────────────────

  fb['arduino_delay'] = function (block) {
    return `delay(${val(block, 'MS', '1000')});\n`;
  };

  fb['arduino_delay_microseconds'] = function (block) {
    return `delayMicroseconds(${val(block, 'US', '100')});\n`;
  };

  fb['arduino_millis'] = function () {
    return ['millis()', gen.ORDER_ATOMIC];
  };

  fb['arduino_micros'] = function () {
    return ['micros()', gen.ORDER_ATOMIC];
  };

  // ── Serial ────────────────────────────────────────────────────────────

  fb['arduino_serial_begin'] = function (block) {
    return `Serial.begin(${block.getFieldValue('BAUD')});\n`;
  };

  fb['arduino_serial_println'] = function (block) {
    return `Serial.println(${val(block, 'TEXT', '""')});\n`;
  };

  fb['arduino_serial_print'] = function (block) {
    return `Serial.print(${val(block, 'TEXT', '""')});\n`;
  };

  fb['arduino_serial_print_base'] = function (block) {
    const mode = block.getFieldValue('MODE');
    const base = block.getFieldValue('BASE');
    return `Serial.${mode}(${val(block, 'TEXT', '0')}, ${base});\n`;
  };

  fb['arduino_serial_println_empty'] = function () {
    return 'Serial.println();\n';
  };

  fb['arduino_serial_write'] = function (block) {
    return `Serial.write(${val(block, 'DATA', '0')});\n`;
  };

  fb['arduino_serial_action'] = function (block) {
    return `Serial.${block.getFieldValue('ACTION')}();\n`;
  };

  fb['arduino_serial_read_value'] = function (block) {
    return [`Serial.${block.getFieldValue('FN')}()`, gen.ORDER_ATOMIC];
  };

  fb['arduino_serial_read_string_until'] = function (block) {
    const ch = block.getFieldValue('CHAR') || '\\n';
    return [`Serial.readStringUntil('${ch}')`, gen.ORDER_ATOMIC];
  };

  fb['arduino_serial_available'] = function () {
    return ['Serial.available()', gen.ORDER_ATOMIC];
  };

  fb['arduino_serial_read'] = function () {
    return ['Serial.read()', gen.ORDER_ATOMIC];
  };

  // ── Variables ─────────────────────────────────────────────────────────

  fb['arduino_variable_declare'] = function (block) {
    const type  = block.getFieldValue('TYPE');
    const name  = block.getFieldValue('NAME');
    const value = val(block, 'VALUE', '0', gen.ORDER_ASSIGNMENT);
    return `${type} ${name} = ${value};\n`;
  };

  fb['arduino_variable_get'] = function (block) {
    return [block.getFieldValue('NAME'), gen.ORDER_ATOMIC];
  };

  fb['arduino_variable_set'] = function (block) {
    const name  = block.getFieldValue('NAME');
    const value = val(block, 'VALUE', '0', gen.ORDER_ASSIGNMENT);
    return `${name} = ${value};\n`;
  };

  fb['arduino_compound_assign'] = function (block) {
    const name  = block.getFieldValue('NAME') || 'miVariable';
    const op    = block.getFieldValue('OP');
    const value = val(block, 'VALUE', '1', gen.ORDER_ASSIGNMENT);
    return `${name} ${op} ${value};\n`;
  };

  fb['arduino_increment'] = function (block) {
    return `${block.getFieldValue('NAME') || 'i'}${block.getFieldValue('OP') || '++'};\n`;
  };

  // ── Variables globales (flotantes, recogidas por workspaceToCode) ─────

  fb['arduino_global_variable_declare'] = function (_block) {
    return '';
  };

  // ── Constantes ────────────────────────────────────────────────────────

  fb['arduino_const_define'] = function (block) {
    if (!block.getSurroundParent()) return ''; // flotante → workspaceToCode lo recoge
    const type  = block.getFieldValue('TYPE') || 'int';
    const name  = block.getFieldValue('NAME') || 'MY_CONST';
    const value = val(block, 'VALUE', '0', gen.ORDER_ASSIGNMENT);
    return `const ${type} ${name} = ${value};\n`;
  };

  // ── Directivas y tipos (flotantes, recogidos por workspaceToCode) ─────

  fb['arduino_include']       = function (_block) { return ''; };
  fb['arduino_define']        = function (_block) { return ''; };
  fb['arduino_struct_define'] = function (_block) { return ''; };
  fb['arduino_enum_define']   = function (_block) { return ''; };

  // ── Arrays ────────────────────────────────────────────────────────────

  fb['arduino_array_declare'] = function (block) {
    if (!block.getSurroundParent()) return ''; // flotante → workspaceToCode lo recoge
    const type = block.getFieldValue('TYPE') || 'int';
    const name = block.getFieldValue('NAME') || 'miArray';
    const size = block.getFieldValue('SIZE') || '10';
    return `${type} ${name}[${size}];\n`;
  };

  fb['arduino_array_declare_init'] = function (block) {
    if (!block.getSurroundParent()) return ''; // flotante → workspaceToCode lo recoge
    const type  = block.getFieldValue('TYPE') || 'int';
    const name  = block.getFieldValue('NAME') || 'miArray';
    const items = (block.getFieldValue('ITEMS') || '').trim();
    return `${type} ${name}[] = {${items}};\n`;
  };

  fb['arduino_array_get'] = function (block) {
    const name  = block.getFieldValue('NAME') || 'miArray';
    const index = val(block, 'INDEX', '0');
    return [`${name}[${index}]`, gen.ORDER_ATOMIC];
  };

  fb['arduino_array_set'] = function (block) {
    const name  = block.getFieldValue('NAME') || 'miArray';
    const index = val(block, 'INDEX', '0');
    const value = val(block, 'VALUE', '0', gen.ORDER_ASSIGNMENT);
    return `${name}[${index}] = ${value};\n`;
  };

  // ── Control ───────────────────────────────────────────────────────────

  fb['arduino_if_simple'] = function (block) {
    const condition = val(block, 'CONDITION', 'false');
    const doCode    = gen.statementToCode(block, 'DO');
    return `if (${condition}) {\n${doCode}}\n`;
  };

  fb['arduino_if'] = function (block) {
    const condition = val(block, 'CONDITION', 'false');
    const doCode    = gen.statementToCode(block, 'DO');
    const elseCode  = gen.statementToCode(block, 'ELSE');
    let code = `if (${condition}) {\n${doCode}}`;
    if (elseCode) code += ` else {\n${elseCode}}`;
    return code + '\n';
  };

  fb['arduino_if_else_if'] = function (block) {
    const if0 = val(block, 'IF0', 'false');
    const if1 = val(block, 'IF1', 'false');
    const do0 = gen.statementToCode(block, 'DO0');
    const do1 = gen.statementToCode(block, 'DO1');
    const els = gen.statementToCode(block, 'ELSE');
    let code = `if (${if0}) {\n${do0}} else if (${if1}) {\n${do1}}`;
    if (els) code += ` else {\n${els}}`;
    return code + '\n';
  };

  fb['arduino_ternary'] = function (block) {
    const cond = val(block, 'COND', 'false');
    const a    = val(block, 'THEN', '0');
    const b    = val(block, 'ELSE', '0');
    return [`(${cond} ? ${a} : ${b})`, gen.ORDER_CONDITIONAL];
  };

  fb['arduino_for'] = function (block) {
    const varName = block.getFieldValue('VAR');
    const from    = val(block, 'FROM', '0');
    const to      = val(block, 'TO', '10');
    const step    = val(block, 'STEP', '1');
    const body    = gen.statementToCode(block, 'DO');
    // Si el paso es una constante negativa el bucle debe ir decreciendo
    const numStep = Number(step);
    const op      = Number.isFinite(numStep) && numStep < 0 ? '>=' : '<=';
    return `for (int ${varName} = ${from}; ${varName} ${op} ${to}; ${varName} += ${step}) {\n${body}}\n`;
  };

  fb['arduino_while'] = function (block) {
    const condition = val(block, 'CONDITION', 'true');
    const body      = gen.statementToCode(block, 'DO');
    return `while (${condition}) {\n${body}}\n`;
  };

  fb['arduino_do_while'] = function (block) {
    const condition = val(block, 'CONDITION', 'true');
    const body      = gen.statementToCode(block, 'DO');
    return `do {\n${body}} while (${condition});\n`;
  };

  fb['arduino_break'] = function () {
    return 'break;\n';
  };

  fb['arduino_continue'] = function () {
    return 'continue;\n';
  };

  fb['arduino_switch_case'] = function (block) {
    const expr     = val(block, 'EXPR',      '0');
    const case1Val = val(block, 'CASE1_VAL', '0');
    const case2Val = val(block, 'CASE2_VAL', '1');

    // blockToCode devuelve código sin indentación (tras el fix de gen.INDENT).
    // Necesitamos 4 espacios (2 para nivel case + 2 para body).
    const ind2 = gen.INDENT + gen.INDENT;
    const b1   = block.getInputTargetBlock('DO1');
    const b2   = block.getInputTargetBlock('DO2');
    const bd   = block.getInputTargetBlock('DEFAULT');
    const do1   = b1 ? gen.prefixLines(gen.blockToCode(b1), ind2) : '';
    const do2   = b2 ? gen.prefixLines(gen.blockToCode(b2), ind2) : '';
    const defDo = bd ? gen.prefixLines(gen.blockToCode(bd), ind2) : '';

    let code = `switch (${expr}) {\n`;
    code += `${gen.INDENT}case ${case1Val}:\n${do1}${ind2}break;\n`;
    code += `${gen.INDENT}case ${case2Val}:\n${do2}${ind2}break;\n`;
    if (defDo) code += `${gen.INDENT}default:\n${defDo}`;
    code += `}\n`;
    return code;
  };

  // ── Matemáticas ───────────────────────────────────────────────────────

  fb['arduino_map'] = function (block) {
    const v  = val(block, 'VALUE',     '0');
    const fl = val(block, 'FROM_LOW',  '0');
    const fh = val(block, 'FROM_HIGH', '1023');
    const tl = val(block, 'TO_LOW',    '0');
    const th = val(block, 'TO_HIGH',   '255');
    return [`map(${v}, ${fl}, ${fh}, ${tl}, ${th})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_constrain'] = function (block) {
    const v   = val(block, 'VALUE', '0');
    const min = val(block, 'MIN',   '0');
    const max = val(block, 'MAX',   '255');
    return [`constrain(${v}, ${min}, ${max})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_min_max'] = function (block) {
    const a = val(block, 'A', '0');
    const b = val(block, 'B', '0');
    return [`${block.getFieldValue('FN')}(${a}, ${b})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_random'] = function (block) {
    const min = val(block, 'MIN', '0');
    const max = val(block, 'MAX', '100');
    return [`random(${min}, ${max})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_random_seed'] = function (block) {
    return `randomSeed(${val(block, 'SEED', 'analogRead(A0)')});\n`;
  };

  // ── Operadores del lenguaje C: módulo y bit a bit ───────────────────────

  fb['arduino_modulo'] = function (block) {
    const a = val(block, 'A', '0');
    const b = val(block, 'B', '1');
    return [`(${a} % ${b})`, gen.ORDER_MULTIPLICATIVE];
  };

  fb['arduino_bitwise'] = function (block) {
    const op = block.getFieldValue('OP');
    const a  = val(block, 'A', '0');
    const b  = val(block, 'B', '0');
    const orders = {
      '&':  gen.ORDER_BITWISE_AND,
      '|':  gen.ORDER_BITWISE_OR,
      '^':  gen.ORDER_BITWISE_XOR,
      '<<': gen.ORDER_SHIFT,
      '>>': gen.ORDER_SHIFT,
    };
    return [`(${a} ${op} ${b})`, orders[op] ?? gen.ORDER_NONE];
  };

  fb['arduino_bitwise_not'] = function (block) {
    return [`~(${val(block, 'VALUE', '0')})`, gen.ORDER_UNARY_PREFIX];
  };

  fb['arduino_bit_read'] = function (block) {
    const v = val(block, 'VALUE', '0');
    const n = val(block, 'BIT', '0');
    return [`bitRead(${v}, ${n})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_bit_write'] = function (block) {
    const name = block.getFieldValue('NAME') || 'miVariable';
    const n    = val(block, 'BIT', '0');
    const v    = val(block, 'VALUE', '1');
    return `bitWrite(${name}, ${n}, ${v});\n`;
  };

  fb['arduino_bit_set_clear'] = function (block) {
    const name = block.getFieldValue('NAME') || 'miVariable';
    const n    = val(block, 'BIT', '0');
    return `${block.getFieldValue('FN')}(${name}, ${n});\n`;
  };

  fb['arduino_bit'] = function (block) {
    return [`bit(${val(block, 'N', '0')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_byte_part'] = function (block) {
    return [`${block.getFieldValue('FN')}(${val(block, 'VALUE', '0')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_cast'] = function (block) {
    return [`(${block.getFieldValue('TYPE')})(${val(block, 'VALUE', '0')})`, gen.ORDER_UNARY_PREFIX];
  };

  fb['arduino_sizeof'] = function (block) {
    return [`sizeof(${block.getFieldValue('NAME') || 'miArray'})`, gen.ORDER_ATOMIC];
  };

  // ── Audio ─────────────────────────────────────────────────────────────

  fb['arduino_tone'] = function (block) {
    const pin  = val(block, 'PIN', '8');
    const freq = val(block, 'FREQ', '440');
    return `tone(${pin}, ${freq});\n`;
  };

  fb['arduino_tone_duration'] = function (block) {
    const pin  = val(block, 'PIN', '8');
    const freq = val(block, 'FREQ', '440');
    const dur  = val(block, 'DURATION', '500');
    return `tone(${pin}, ${freq}, ${dur});\n`;
  };

  fb['arduino_no_tone'] = function (block) {
    return `noTone(${val(block, 'PIN', '8')});\n`;
  };

  // ── Comentarios y código libre ────────────────────────────────────────

  fb['arduino_comment'] = function (block) {
    return `// ${block.getFieldValue('TEXT')}\n`;
  };

  fb['arduino_block_comment'] = function (block) {
    return `/* ${block.getFieldValue('TEXT')} */\n`;
  };

  fb['arduino_raw_statement'] = function (block) {
    const code = (block.getFieldValue('CODE') || '').trim();
    if (!code) return '';
    return (/[;}]$/.test(code) ? code : code + ';') + '\n';
  };

  fb['arduino_raw_expression'] = function (block) {
    const code = (block.getFieldValue('CODE') || '0').trim().replace(/;$/, '');
    return [code || '0', gen.ORDER_NONE];
  };

  // ── Lógica ────────────────────────────────────────────────────────────

  fb['arduino_compare'] = function (block) {
    const a  = val(block, 'A', '0', gen.ORDER_RELATIONAL);
    const op = block.getFieldValue('OP');
    const b  = val(block, 'B', '0', gen.ORDER_RELATIONAL);
    return [`(${a} ${op} ${b})`, gen.ORDER_EQUALITY];
  };

  fb['arduino_logic'] = function (block) {
    const a   = val(block, 'A', 'false', gen.ORDER_LOGICAL_AND);
    const op  = block.getFieldValue('OP');
    const b   = val(block, 'B', 'false', gen.ORDER_LOGICAL_AND);
    const ord = op === '&&' ? gen.ORDER_LOGICAL_AND : gen.ORDER_LOGICAL_OR;
    return [`(${a} ${op} ${b})`, ord];
  };

  fb['arduino_not'] = function (block) {
    return [`!(${val(block, 'VALUE', 'false', gen.ORDER_UNARY_PREFIX)})`, gen.ORDER_UNARY_PREFIX];
  };

  // ── Texto / String ────────────────────────────────────────────────────

  fb['arduino_char'] = function (block) {
    const raw = block.getFieldValue('CHAR') || 'A';
    const c = raw === '\\' ? '\\\\' : raw === "'" ? "\\'" : raw;
    return [`'${c}'`, gen.ORDER_ATOMIC];
  };

  fb['arduino_string_cast'] = function (block) {
    return [`String(${val(block, 'VALUE', '0')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_string_length'] = function (block) {
    return [`${val(block, 'STR', '""')}.length()`, gen.ORDER_UNARY_POSTFIX];
  };

  fb['arduino_string_concat'] = function (block) {
    const a = val(block, 'A', '""');
    const b = val(block, 'B', '""');
    return [`String(${a}) + String(${b})`, gen.ORDER_ADDITIVE];
  };

  fb['arduino_string_substring'] = function (block) {
    const s    = val(block, 'STR', '""');
    const from = val(block, 'FROM', '0');
    const to   = val(block, 'TO', '1');
    return [`${s}.substring(${from}, ${to})`, gen.ORDER_UNARY_POSTFIX];
  };

  fb['arduino_string_index_of'] = function (block) {
    const s   = val(block, 'STR', '""');
    const sub = val(block, 'SUB', '""');
    return [`${s}.indexOf(${sub})`, gen.ORDER_UNARY_POSTFIX];
  };

  fb['arduino_string_char_at'] = function (block) {
    const s = val(block, 'STR', '""');
    const i = val(block, 'INDEX', '0');
    return [`${s}.charAt(${i})`, gen.ORDER_UNARY_POSTFIX];
  };

  fb['arduino_string_to_number'] = function (block) {
    const s = val(block, 'STR', '""');
    return [`${s}.${block.getFieldValue('FN')}()`, gen.ORDER_UNARY_POSTFIX];
  };

  fb['arduino_string_transform'] = function (block) {
    const s = val(block, 'STR', '""');
    return `${s}.${block.getFieldValue('FN')}();\n`;
  };

  fb['arduino_string_compare'] = function (block) {
    const a = val(block, 'A', '""');
    const b = val(block, 'B', '""');
    return [`${a}.${block.getFieldValue('FN')}(${b})`, gen.ORDER_UNARY_POSTFIX];
  };

  fb['arduino_char_check'] = function (block) {
    return [`${block.getFieldValue('FN')}(${val(block, 'VALUE', "' '")})`, gen.ORDER_ATOMIC];
  };

  // ── Bloques built-in de Blockly ───────────────────────────────────────

  fb['math_number'] = function (block) {
    return [String(block.getFieldValue('NUM')), gen.ORDER_ATOMIC];
  };

  fb['math_arithmetic'] = function (block) {
    const ops = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: null };
    const op  = block.getFieldValue('OP');
    const a   = val(block, 'A', '0', gen.ORDER_ADDITIVE);
    const b   = val(block, 'B', '0', gen.ORDER_ADDITIVE);
    if (op === 'POWER') return [`pow(${a}, ${b})`, gen.ORDER_ATOMIC];
    return [`(${a} ${ops[op]} ${b})`, gen.ORDER_ADDITIVE];
  };

  fb['text'] = function (block) {
    const text = block.getFieldValue('TEXT').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return [`"${text}"`, gen.ORDER_ATOMIC];
  };

  fb['logic_boolean'] = function (block) {
    return [block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false', gen.ORDER_ATOMIC];
  };

  fb['logic_negate'] = function (block) {
    return [`!(${val(block, 'BOOL', 'false', gen.ORDER_UNARY_PREFIX)})`, gen.ORDER_UNARY_PREFIX];
  };

  fb['logic_compare'] = function (block) {
    const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[block.getFieldValue('OP')];
    const a  = val(block, 'A', '0', gen.ORDER_EQUALITY);
    const b  = val(block, 'B', '0', gen.ORDER_EQUALITY);
    return [`(${a} ${op} ${b})`, gen.ORDER_EQUALITY];
  };

  fb['logic_operation'] = function (block) {
    const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const a  = val(block, 'A', 'false', gen.ORDER_LOGICAL_AND);
    const b  = val(block, 'B', 'false', gen.ORDER_LOGICAL_AND);
    return [`(${a} ${op} ${b})`, gen.ORDER_LOGICAL_AND];
  };

  fb['math_single'] = function (block) {
    const op   = block.getFieldValue('OP');
    const n    = val(block, 'NUM', '0');
    const fns  = {
      ROOT: `sqrt(${n})`, ABS: `abs(${n})`, NEG: `-(${n})`,
      LN: `log(${n})`, LOG10: `log10(${n})`, EXP: `exp(${n})`, POW10: `pow(10, ${n})`,
    };
    return [fns[op] || n, gen.ORDER_ATOMIC];
  };

  fb['math_trig'] = function (block) {
    const op = block.getFieldValue('OP').toLowerCase();
    const n  = val(block, 'NUM', '0');
    return [`${op}(${n})`, gen.ORDER_ATOMIC];
  };

  // ── Funciones personalizadas ───────────────────────────────────────────

  fb['arduino_function_define'] = function (_block) {
    return ''; // generado directamente en workspaceToCode
  };

  fb['arduino_return'] = function (block) {
    return `return ${val(block, 'VALUE', '0')};\n`;
  };

  fb['arduino_return_void'] = function (_block) {
    return `return;\n`;
  };

  fb['arduino_function_call'] = function (block) {
    const name = block.getFieldValue('NAME') || 'miFuncion';
    const args = block.getFieldValue('ARGS') || '';
    return `${name}(${args});\n`;
  };

  fb['arduino_function_call_expr'] = function (block) {
    const name = block.getFieldValue('NAME') || 'miFuncion';
    const args = block.getFieldValue('ARGS') || '';
    return [`${name}(${args})`, gen.ORDER_ATOMIC];
  };

  return gen;
}

export { arduinoGenerator };
