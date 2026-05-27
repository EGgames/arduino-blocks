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
    if (includesCode) includesCode += '\n';

    // 2. Variables y constantes globales (solo bloques flotantes)
    let globalsCode = '';
    for (const b of [
      ...workspace.getBlocksByType('arduino_global_variable_declare'),
      ...workspace.getBlocksByType('kids_global_var'),
    ]) {
      if (b.getSurroundParent()) continue;
      const type  = b.getFieldValue('TYPE') || 'int';
      const name  = b.getFieldValue('NAME') || 'globalVar';
      const value = this.valueToCode(b, 'VALUE', this.ORDER_ASSIGNMENT) || '0';
      globalsCode += `${type} ${name} = ${value};\n`;
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

  // ── Estructura principal ───────────────────────────────────────────────

  fb['arduino_setup_loop'] = function (_block) {
    return ''; // generado directamente en workspaceToCode
  };
  fb['kids_setup_loop'] = function (_block) {
    return ''; // generado directamente en workspaceToCode (igual que arduino_setup_loop)
  };

  // ── Pines ─────────────────────────────────────────────────────────────

  fb['arduino_pin_mode'] = function (block) {
    const pin  = block.getFieldValue('PIN');
    const mode = block.getFieldValue('MODE');
    return `pinMode(${pin}, ${mode});\n`;
  };

  fb['arduino_digital_write'] = function (block) {
    const pin   = block.getFieldValue('PIN');
    const value = block.getFieldValue('VALUE');
    return `digitalWrite(${pin}, ${value});\n`;
  };

  fb['arduino_digital_read'] = function (block) {
    return [`digitalRead(${block.getFieldValue('PIN')})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_analog_write'] = function (block) {
    const pin   = block.getFieldValue('PIN');
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_NONE) || '0';
    return `analogWrite(${pin}, ${value});\n`;
  };

  fb['arduino_analog_read'] = function (block) {
    return [`analogRead(A${block.getFieldValue('PIN')})`, gen.ORDER_ATOMIC];
  };

  // ── Tiempo ────────────────────────────────────────────────────────────

  fb['arduino_delay'] = function (block) {
    return `delay(${gen.valueToCode(block, 'MS', gen.ORDER_NONE) || '1000'});\n`;
  };

  fb['arduino_delay_microseconds'] = function (block) {
    return `delayMicroseconds(${gen.valueToCode(block, 'US', gen.ORDER_NONE) || '100'});\n`;
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
    return `Serial.println(${gen.valueToCode(block, 'TEXT', gen.ORDER_NONE) || '""'});\n`;
  };

  fb['arduino_serial_print'] = function (block) {
    return `Serial.print(${gen.valueToCode(block, 'TEXT', gen.ORDER_NONE) || '""'});\n`;
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
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ASSIGNMENT) || '0';
    return `${type} ${name} = ${value};\n`;
  };

  fb['arduino_variable_get'] = function (block) {
    return [block.getFieldValue('NAME'), gen.ORDER_ATOMIC];
  };

  fb['arduino_variable_set'] = function (block) {
    const name  = block.getFieldValue('NAME');
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ASSIGNMENT) || '0';
    return `${name} = ${value};\n`;
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
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ASSIGNMENT) || '0';
    return `const ${type} ${name} = ${value};\n`;
  };

  // ── #include (flotante, recogido por workspaceToCode) ────────────────

  fb['arduino_include'] = function (_block) {
    return '';
  };

  // ── #define (flotante, recogido por workspaceToCode) ─────────────────

  fb['arduino_define'] = function (_block) {
    return '';
  };

  // ── Arrays ────────────────────────────────────────────────────────────

  fb['arduino_array_declare'] = function (block) {
    if (!block.getSurroundParent()) return ''; // flotante → workspaceToCode lo recoge
    const type = block.getFieldValue('TYPE') || 'int';
    const name = block.getFieldValue('NAME') || 'miArray';
    const size = block.getFieldValue('SIZE') || '10';
    return `${type} ${name}[${size}];\n`;
  };

  fb['arduino_array_get'] = function (block) {
    const name  = block.getFieldValue('NAME') || 'miArray';
    const index = gen.valueToCode(block, 'INDEX', gen.ORDER_NONE) || '0';
    return [`${name}[${index}]`, gen.ORDER_ATOMIC];
  };

  fb['arduino_array_set'] = function (block) {
    const name  = block.getFieldValue('NAME') || 'miArray';
    const index = gen.valueToCode(block, 'INDEX', gen.ORDER_NONE) || '0';
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ASSIGNMENT) || '0';
    return `${name}[${index}] = ${value};\n`;
  };

  // ── Control ───────────────────────────────────────────────────────────

  fb['arduino_if_simple'] = function (block) {
    const condition = gen.valueToCode(block, 'CONDITION', gen.ORDER_NONE) || 'false';
    const doCode    = gen.statementToCode(block, 'DO');
    return `if (${condition}) {\n${doCode}}\n`;
  };

  fb['arduino_if'] = function (block) {
    const condition = gen.valueToCode(block, 'CONDITION', gen.ORDER_NONE) || 'false';
    const doCode    = gen.statementToCode(block, 'DO');
    const elseCode  = gen.statementToCode(block, 'ELSE');
    let code = `if (${condition}) {\n${doCode}}`;
    if (elseCode) code += ` else {\n${elseCode}}`;
    return code + '\n';
  };

  fb['arduino_for'] = function (block) {
    const varName = block.getFieldValue('VAR');
    const from    = block.getFieldValue('FROM');
    const to      = block.getFieldValue('TO');
    const step    = block.getFieldValue('STEP');
    const body    = gen.statementToCode(block, 'DO');
    const op      = Number(step) >= 0 ? '<=' : '>=';
    return `for (int ${varName} = ${from}; ${varName} ${op} ${to}; ${varName} += ${step}) {\n${body}}\n`;
  };

  fb['arduino_while'] = function (block) {
    const condition = gen.valueToCode(block, 'CONDITION', gen.ORDER_NONE) || 'true';
    const body      = gen.statementToCode(block, 'DO');
    return `while (${condition}) {\n${body}}\n`;
  };

  fb['arduino_do_while'] = function (block) {
    const condition = gen.valueToCode(block, 'CONDITION', gen.ORDER_NONE) || 'true';
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
    const expr     = gen.valueToCode(block, 'EXPR',      gen.ORDER_NONE) || '0';
    const case1Val = gen.valueToCode(block, 'CASE1_VAL', gen.ORDER_NONE) || '0';
    const case2Val = gen.valueToCode(block, 'CASE2_VAL', gen.ORDER_NONE) || '1';

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
    const v  = gen.valueToCode(block, 'VALUE',     gen.ORDER_NONE) || '0';
    const fl = gen.valueToCode(block, 'FROM_LOW',  gen.ORDER_NONE) || '0';
    const fh = gen.valueToCode(block, 'FROM_HIGH', gen.ORDER_NONE) || '1023';
    const tl = gen.valueToCode(block, 'TO_LOW',    gen.ORDER_NONE) || '0';
    const th = gen.valueToCode(block, 'TO_HIGH',   gen.ORDER_NONE) || '255';
    return [`map(${v}, ${fl}, ${fh}, ${tl}, ${th})`, gen.ORDER_ATOMIC];
  };

  fb['arduino_constrain'] = function (block) {
    const v   = gen.valueToCode(block, 'VALUE', gen.ORDER_NONE) || '0';
    const min = gen.valueToCode(block, 'MIN',   gen.ORDER_NONE) || '0';
    const max = gen.valueToCode(block, 'MAX',   gen.ORDER_NONE) || '255';
    return [`constrain(${v}, ${min}, ${max})`, gen.ORDER_ATOMIC];
  };

  // ── Audio ─────────────────────────────────────────────────────────────

  fb['arduino_tone'] = function (block) {
    const pin  = block.getFieldValue('PIN');
    const freq = gen.valueToCode(block, 'FREQ', gen.ORDER_NONE) || '440';
    return `tone(${pin}, ${freq});\n`;
  };

  fb['arduino_no_tone'] = function (block) {
    return `noTone(${block.getFieldValue('PIN')});\n`;
  };

  // ── Comentario ────────────────────────────────────────────────────────

  fb['arduino_comment'] = function (block) {
    return `// ${block.getFieldValue('TEXT')}\n`;
  };

  // ── Lógica ────────────────────────────────────────────────────────────

  fb['arduino_compare'] = function (block) {
    const a  = gen.valueToCode(block, 'A', gen.ORDER_RELATIONAL) || '0';
    const op = block.getFieldValue('OP');
    const b  = gen.valueToCode(block, 'B', gen.ORDER_RELATIONAL) || '0';
    return [`(${a} ${op} ${b})`, gen.ORDER_EQUALITY];
  };

  fb['arduino_logic'] = function (block) {
    const a   = gen.valueToCode(block, 'A', gen.ORDER_LOGICAL_AND) || 'false';
    const op  = block.getFieldValue('OP');
    const b   = gen.valueToCode(block, 'B', gen.ORDER_LOGICAL_AND) || 'false';
    const ord = op === '&&' ? gen.ORDER_LOGICAL_AND : gen.ORDER_LOGICAL_OR;
    return [`(${a} ${op} ${b})`, ord];
  };

  fb['arduino_not'] = function (block) {
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_UNARY_PREFIX) || 'false';
    return [`!(${value})`, gen.ORDER_UNARY_PREFIX];
  };

  // ── Bloques built-in de Blockly ───────────────────────────────────────

  fb['math_number'] = function (block) {
    return [String(block.getFieldValue('NUM')), gen.ORDER_ATOMIC];
  };

  fb['math_arithmetic'] = function (block) {
    const ops = { ADD: '+', MINUS: '-', MULTIPLY: '*', DIVIDE: '/', POWER: null };
    const op  = block.getFieldValue('OP');
    const a   = gen.valueToCode(block, 'A', gen.ORDER_ADDITIVE) || '0';
    const b   = gen.valueToCode(block, 'B', gen.ORDER_ADDITIVE) || '0';
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
    const value = gen.valueToCode(block, 'BOOL', gen.ORDER_UNARY_PREFIX) || 'false';
    return [`!(${value})`, gen.ORDER_UNARY_PREFIX];
  };

  fb['logic_compare'] = function (block) {
    const op = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' }[block.getFieldValue('OP')];
    const a  = gen.valueToCode(block, 'A', gen.ORDER_EQUALITY) || '0';
    const b  = gen.valueToCode(block, 'B', gen.ORDER_EQUALITY) || '0';
    return [`(${a} ${op} ${b})`, gen.ORDER_EQUALITY];
  };

  fb['logic_operation'] = function (block) {
    const op = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
    const a  = gen.valueToCode(block, 'A', gen.ORDER_LOGICAL_AND) || 'false';
    const b  = gen.valueToCode(block, 'B', gen.ORDER_LOGICAL_AND) || 'false';
    return [`(${a} ${op} ${b})`, gen.ORDER_LOGICAL_AND];
  };

  fb['math_single'] = function (block) {
    const op   = block.getFieldValue('OP');
    const n    = gen.valueToCode(block, 'NUM', gen.ORDER_NONE) || '0';
    const fns  = {
      ROOT: `sqrt(${n})`, ABS: `abs(${n})`, NEG: `-(${n})`,
      LN: `log(${n})`, LOG10: `log10(${n})`, EXP: `exp(${n})`, POW10: `pow(10, ${n})`,
    };
    return [fns[op] || n, gen.ORDER_ATOMIC];
  };

  fb['math_trig'] = function (block) {
    const op = block.getFieldValue('OP').toLowerCase();
    const n  = gen.valueToCode(block, 'NUM', gen.ORDER_NONE) || '0';
    return [`${op}(${n})`, gen.ORDER_ATOMIC];
  };

  // ── Funciones personalizadas ───────────────────────────────────────────

  fb['arduino_function_define'] = function (_block) {
    return ''; // generado directamente en workspaceToCode
  };

  fb['arduino_return'] = function (block) {
    const value = gen.valueToCode(block, 'VALUE', gen.ORDER_NONE) || '0';
    return `return ${value};\n`;
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
