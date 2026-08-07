/**
 * AST → Blockly XML Generator
 * Convierte el AST producido por codeParser en XML para Blockly.
 *
 * Mapa de bloques (campo vs. valor según arduinoBlocks.js):
 *   arduino_pin_mode          PIN=value(expr) MODE=field(ident)
 *   arduino_digital_write     PIN=value(expr) VALUE=value(HIGH|LOW|expr)
 *   arduino_digital_read      PIN=value(expr) → output
 *   arduino_analog_write      PIN=value(expr) VALUE=value(expr)
 *   arduino_analog_read       PIN=value(pin analógico) → output
 *   arduino_delay             MS=value(expr)
 *   arduino_delay_microseconds US=value(expr)
 *   arduino_serial_begin      BAUD=field(dropdown)
 *   arduino_serial_println    TEXT=value(expr)
 *   arduino_serial_print      TEXT=value(expr)
 *   arduino_variable_declare  TYPE=field  NAME=field  VALUE=value(expr)
 *   arduino_variable_get      NAME=field  → output
 *   arduino_variable_set      NAME=field  VALUE=value(expr)
 *   arduino_if                CONDITION=value  DO=statement  ELSE=statement
 *   arduino_for               VAR=field  FROM=value  TO=value  STEP=value  DO=statement
 *   arduino_while             CONDITION=value  DO=statement
 *   arduino_map               VALUE FROM_LOW FROM_HIGH TO_LOW TO_HIGH → output
 *   arduino_constrain         VALUE MIN MAX → output
 *   arduino_millis            → output
 *   arduino_tone              PIN=value  FREQ=value
 *   arduino_no_tone           PIN=value
 *   arduino_comment           TEXT=field
 *   arduino_compare           OP=field  A=value  B=value  → output
 *   arduino_logic             OP=field  A=value  B=value  → output
 *   arduino_not               VALUE=value  → output
 *   arduino_modulo            A=value  B=value  → output (operador %)
 *   arduino_bitwise           OP=field (&|^<<>>)  A=value  B=value  → output
 *   arduino_bitwise_not       VALUE=value  → output (operador ~)
 */

import { parseArduinoCode } from './codeParser';

let _id = 0;
const nid = () => `b${++_id}`;
const esc = (s) =>
  String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ─── Encadenar bloques con <next> ────────────────────────────────────────────

function chain(xmlList) {
  const items = xmlList.filter(Boolean);
  if (!items.length) return '';
  let result = items[items.length - 1];
  for (let i = items.length - 2; i >= 0; i--) {
    const last = items[i].lastIndexOf('</block>');
    if (last === -1) {
      result = items[i] + result;
    } else {
      result = items[i].slice(0, last) + `<next>${result}</next>` + items[i].slice(last);
    }
  }
  return result;
}

// ─── Bloques de expresión ────────────────────────────────────────────────────

function numBlock(v) {
  return `<block type="math_number" id="${nid()}"><field name="NUM">${esc(v)}</field></block>`;
}

/** Envuelve una expresión en <value name="NAME"> */
function valueWrap(name, expr) {
  return `<value name="${name}">${exprBlock(expr)}</value>`;
}

/** Expresión → bloque XML (retorna el XML del bloque, sin value wrapper) */
function exprBlock(expr) {
  if (!expr) return numBlock(0);

  switch (expr.type) {
    case 'num':
      return numBlock(expr.value);

    case 'str':
      return `<block type="text" id="${nid()}"><field name="TEXT">${esc(expr.value)}</field></block>`;

    case 'bool':
      return `<block type="logic_boolean" id="${nid()}"><field name="BOOL">${expr.value ? 'TRUE' : 'FALSE'}</field></block>`;

    case 'ident':
      // HIGH/LOW → variable get (el generador de bloques lee 'NAME')
      return `<block type="arduino_variable_get" id="${nid()}"><field name="NAME">${esc(expr.name)}</field></block>`;

    case 'binop': {
      const { op, left, right } = expr;
      if (['==','!=','<','>','<=','>='].includes(op)) {
        return `<block type="arduino_compare" id="${nid()}"><field name="OP">${esc(op)}</field>${valueWrap('A',left)}${valueWrap('B',right)}</block>`;
      }
      if (op === '&&' || op === '||') {
        return `<block type="arduino_logic" id="${nid()}"><field name="OP">${op === '&&' ? '&&' : '||'}</field>${valueWrap('A',left)}${valueWrap('B',right)}</block>`;
      }
      if (op === '%') {
        return `<block type="arduino_modulo" id="${nid()}">${valueWrap('A',left)}${valueWrap('B',right)}</block>`;
      }
      if (['&','|','^','<<','>>'].includes(op)) {
        return `<block type="arduino_bitwise" id="${nid()}"><field name="OP">${esc(op)}</field>${valueWrap('A',left)}${valueWrap('B',right)}</block>`;
      }
      const opMap = { '+':'ADD', '-':'MINUS', '*':'MULTIPLY', '/':'DIVIDE' };
      return `<block type="math_arithmetic" id="${nid()}"><field name="OP">${opMap[op]||'ADD'}</field>${valueWrap('A',left)}${valueWrap('B',right)}</block>`;
    }

    case 'unop': {
      const { op, operand } = expr;
      if (op === '!')   return `<block type="arduino_not" id="${nid()}">${valueWrap('VALUE',operand)}</block>`;
      if (op === '~')   return `<block type="arduino_bitwise_not" id="${nid()}">${valueWrap('VALUE',operand)}</block>`;
      if (op === 'neg') return `<block type="math_arithmetic" id="${nid()}"><field name="OP">MINUS</field>${valueWrap('A',{type:'num',value:0})}${valueWrap('B',operand)}</block>`;
      return exprBlock(operand); // ++/-- como expresión: ignorar el operador
    }

    case 'call': {
      const { name, args } = expr;
      if (name === 'digitalRead') return `<block type="arduino_digital_read" id="${nid()}">${pinValue('PIN', args[0], 2)}</block>`;
      if (name === 'analogRead')  return `<block type="arduino_analog_read"  id="${nid()}">${analogPinValue(args[0])}</block>`;
      if (name === 'millis')      return `<block type="arduino_millis" id="${nid()}"></block>`;
      if (name === 'micros')      return `<block type="arduino_micros" id="${nid()}"></block>`;
      if (name === 'map')         return `<block type="arduino_map" id="${nid()}">${valueWrap('VALUE',args[0])}${valueWrap('FROM_LOW',args[1])}${valueWrap('FROM_HIGH',args[2])}${valueWrap('TO_LOW',args[3])}${valueWrap('TO_HIGH',args[4])}</block>`;
      if (name === 'constrain')   return `<block type="arduino_constrain" id="${nid()}">${valueWrap('VALUE',args[0])}${valueWrap('MIN',args[1])}${valueWrap('MAX',args[2])}</block>`;
      if (name === 'min' || name === 'max')
        return `<block type="arduino_min_max" id="${nid()}"><field name="FN">${name}</field>${valueWrap('A',args[0])}${valueWrap('B',args[1])}</block>`;
      if (name === 'random' && args.length >= 2)
        return `<block type="arduino_random" id="${nid()}">${valueWrap('MIN',args[0])}${valueWrap('MAX',args[1])}</block>`;
      if (name === 'bitRead')
        return `<block type="arduino_bit_read" id="${nid()}">${valueWrap('VALUE',args[0])}${valueWrap('BIT',args[1])}</block>`;
      if (name === 'bit')
        return `<block type="arduino_bit" id="${nid()}">${valueWrap('N',args[0])}</block>`;
      if (name === 'lowByte' || name === 'highByte')
        return `<block type="arduino_byte_part" id="${nid()}"><field name="FN">${name}</field>${valueWrap('VALUE',args[0])}</block>`;
      if (name === 'pulseIn')
        return `<block type="arduino_pulse_in" id="${nid()}"><field name="STATE">${identArg(args[1],'HIGH') === 'LOW' ? 'LOW' : 'HIGH'}</field>${pinValue('PIN',args[0],7)}</block>`;
      if (name === 'Serial.available') return `<block type="arduino_serial_available" id="${nid()}"></block>`;
      if (name === 'Serial.read')      return `<block type="arduino_serial_read" id="${nid()}"></block>`;
      if (['Serial.parseInt','Serial.parseFloat','Serial.peek','Serial.readString'].includes(name))
        return `<block type="arduino_serial_read_value" id="${nid()}"><field name="FN">${esc(name.slice(7))}</field></block>`;
      // Llamada desconocida → bloque arduino_function_call_expr (conservando argumentos)
      return `<block type="arduino_function_call_expr" id="${nid()}"><field name="NAME">${esc(name)}</field><field name="ARGS">${esc(argsToC(args))}</field></block>`;
    }

    default:
      return numBlock(0);
  }
}

// ─── Helpers para campos ────────────────────────────────────────────────────

/** Obtiene el valor numérico de un arg de expresión, o devuelve el default */
function numArg(expr, def = 0) {
  if (!expr) return def;
  if (expr.type === 'num') return expr.value;
  return def;
}

/**
 * Genera `<value name="…">` para un pin: números literales como math_number,
 * cualquier otra expresión (variable, constante, llamada) como su propio bloque,
 * de modo que se pueda enchufar un bloque de variable en el hueco.
 */
function pinValue(name, expr, def = 13) {
  if (!expr) return `<value name="${name}">${numBlock(def)}</value>`;
  return `<value name="${name}">${exprBlock(expr)}</value>`;
}

/** `<value name="PIN">` para analogRead: usa el bloque de pin analógico A0…A15 */
function analogPinValue(expr) {
  const analogPin = (p) => `<block type="arduino_analog_pin" id="${nid()}"><field name="PIN">${esc(p)}</field></block>`;
  if (!expr) return `<value name="PIN">${analogPin('A0')}</value>`;
  if (expr.type === 'num')   return `<value name="PIN">${analogPin('A' + expr.value)}</value>`;
  if (expr.type === 'ident' && /^A\d+$/.test(expr.name)) return `<value name="PIN">${analogPin(expr.name)}</value>`;
  return `<value name="PIN">${exprBlock(expr)}</value>`;
}

/** `<value name="VALUE">` para digitalWrite: HIGH/LOW como bloque de estado digital */
function digitalStateValue(expr) {
  const stateBlock = (s) => `<block type="arduino_digital_state" id="${nid()}"><field name="STATE">${s}</field></block>`;
  if (!expr) return `<value name="VALUE">${stateBlock('HIGH')}</value>`;
  if (expr.type === 'ident' && (expr.name === 'HIGH' || expr.name === 'LOW')) {
    return `<value name="VALUE">${stateBlock(expr.name)}</value>`;
  }
  if (expr.type === 'num') return `<value name="VALUE">${stateBlock(expr.value ? 'HIGH' : 'LOW')}</value>`;
  return `<value name="VALUE">${exprBlock(expr)}</value>`;
}

/** Obtiene el nombre de un ident, o devuelve el default */
function identArg(expr, def = '') {
  if (!expr) return def;
  if (expr.type === 'ident') return expr.name;
  if (expr.type === 'num')   return String(expr.value);
  return def;
}

/** Redondea baud rate al valor del dropdown más cercano */
function clampBaud(v) {
  const opts = [9600, 19200, 38400, 57600, 115200];
  const n = Number(v) || 9600;
  return String(opts.reduce((prev, cur) => (Math.abs(cur - n) < Math.abs(prev - n) ? cur : prev)));
}

const numExpr = (v) => ({ type: 'num', value: v });

/**
 * Analiza la estructura de un for y extrae VAR y las expresiones FROM/TO/STEP.
 * Los límites pueden ser variables, no solo números: `for (int i = 0; i < n; i++)`.
 */
function analyzeFor(stmt) {
  let varName = 'i';
  let from = numExpr(0);
  let to   = numExpr(10);
  let step = numExpr(1);

  if (stmt.init?.type === 'vardecl') {
    varName = stmt.init.name || 'i';
    from = stmt.init.value || numExpr(0);
  } else if (stmt.init?.type === 'assign') {
    varName = stmt.init.target?.name || 'i';
    from = stmt.init.value || numExpr(0);
  }

  if (stmt.cond?.type === 'binop') {
    const rhs = stmt.cond.right || numExpr(10);
    const isNum = rhs.type === 'num';
    // El bloque `for` genera `i <= TO`, así que hay que ajustar los límites
    // estrictos (`<` y `>`) restando o sumando uno.
    switch (stmt.cond.op) {
      case '<':
        to = isNum ? numExpr(rhs.value - 1) : { type: 'binop', op: '-', left: rhs, right: numExpr(1) };
        break;
      case '>':
        to = isNum ? numExpr(rhs.value + 1) : { type: 'binop', op: '+', left: rhs, right: numExpr(1) };
        break;
      default:
        to = rhs;
    }
  }

  if (stmt.update) {
    const u = stmt.update;
    if (u.type === 'unop') {
      if (u.op === '++post' || u.op === '++pre') step = numExpr(1);
      if (u.op === '--post' || u.op === '--pre') step = numExpr(-1);
    } else if (u.type === 'assign') {
      const delta = u.value || numExpr(1);
      if (u.op === '+=') step = delta;
      if (u.op === '-=') {
        step = delta.type === 'num'
          ? numExpr(-delta.value)
          : { type: 'unop', op: 'neg', operand: delta };
      }
    }
  }

  return { varName, from, to, step };
}

// ─── Sentencias ──────────────────────────────────────────────────────────────

function stmtBlock(stmt) {
  if (!stmt) return '';

  switch (stmt.type) {
    case 'comment':
      return `<block type="arduino_comment" id="${nid()}"><field name="TEXT">${esc(stmt.text)}</field></block>`;

    case 'vardecl': {
      const typeMap = { 'int':'int','float':'float','bool':'bool','boolean':'bool','String':'String','long':'long','byte':'byte','double':'float','short':'int' };
      const t = typeMap[stmt.varType] || 'int';
      return `<block type="arduino_variable_declare" id="${nid()}"><field name="TYPE">${esc(t)}</field><field name="NAME">${esc(stmt.name)}</field>${valueWrap('VALUE', stmt.value || { type:'num', value:0 })}</block>`;
    }

    case 'exprStmt':
      return callOrAssignBlock(stmt.expr);

    case 'if': {
      const thenXml = chain(stmt.then.map(stmtBlock));
      const elseXml = stmt.else?.length ? chain(stmt.else.map(stmtBlock)) : '';
      return `<block type="arduino_if" id="${nid()}">${valueWrap('CONDITION', stmt.cond)}<statement name="DO">${thenXml}</statement>${elseXml ? `<statement name="ELSE">${elseXml}</statement>` : ''}</block>`;
    }

    case 'for': {
      const { varName, from, to, step } = analyzeFor(stmt);
      const bodyXml = chain(stmt.body.map(stmtBlock));
      return `<block type="arduino_for" id="${nid()}"><field name="VAR">${esc(varName)}</field>${valueWrap('FROM', from)}${valueWrap('TO', to)}${valueWrap('STEP', step)}<statement name="DO">${bodyXml}</statement></block>`;
    }

    case 'while': {
      const bodyXml = chain(stmt.body.map(stmtBlock));
      return `<block type="arduino_while" id="${nid()}">${valueWrap('CONDITION', stmt.cond)}<statement name="DO">${bodyXml}</statement></block>`;
    }

    case 'dowhile': {
      const bodyXml = chain(stmt.body.map(stmtBlock));
      return `<block type="arduino_do_while" id="${nid()}"><statement name="DO">${bodyXml}</statement>${valueWrap('CONDITION', stmt.cond)}</block>`;
    }

    case 'arraydecl': {
      const arrTypeMap = { 'int':'int','float':'float','byte':'byte','bool':'bool','boolean':'bool' };
      const t = arrTypeMap[stmt.varType] || arrTypeMap[(stmt.varType || '').split(' ').pop()] || 'int';
      const size = stmt.size?.type === 'num' ? stmt.size.value : (stmt.items?.length || 10);
      return `<block type="arduino_array_declare" id="${nid()}"><field name="TYPE">${esc(t)}</field><field name="NAME">${esc(stmt.name)}</field><field name="SIZE">${esc(size)}</field></block>`;
    }

    case 'switch': {
      const c0 = stmt.cases[0] || null;
      const c1 = stmt.cases[1] || null;
      const do1Xml = c0 ? chain(c0.body.map(stmtBlock)) : '';
      const do2Xml = c1 ? chain(c1.body.map(stmtBlock)) : '';
      const defXml = chain((stmt.defaultBody || []).map(stmtBlock));
      return [
        `<block type="arduino_switch_case" id="${nid()}">`,
        valueWrap('EXPR', stmt.expr),
        valueWrap('CASE1_VAL', c0?.val || { type: 'num', value: 0 }),
        do1Xml ? `<statement name="DO1">${do1Xml}</statement>` : '',
        valueWrap('CASE2_VAL', c1?.val || { type: 'num', value: 1 }),
        do2Xml ? `<statement name="DO2">${do2Xml}</statement>` : '',
        defXml ? `<statement name="DEFAULT">${defXml}</statement>` : '',
        `</block>`,
      ].join('');
    }

    case 'return': {
      if (!stmt.value) return `<block type="arduino_return_void" id="${nid()}"></block>`;
      return `<block type="arduino_return" id="${nid()}">${valueWrap('VALUE', stmt.value)}</block>`;
    }

    case 'assign': {
      const name = stmt.target?.name || stmt.target?.value || 'x';
      return `<block type="arduino_variable_set" id="${nid()}"><field name="NAME">${esc(name)}</field>${valueWrap('VALUE', stmt.value)}</block>`;
    }

    default:
      return '';
  }
}

/** Convierte una expresión-sentencia (llamada o asignación) en bloque */
function callOrAssignBlock(expr) {
  if (!expr) return '';

  // Asignación directa: x = valor
  if (expr.type === 'assign') {
    const name = expr.target?.name || 'x';
    return `<block type="arduino_variable_set" id="${nid()}"><field name="NAME">${esc(name)}</field>${valueWrap('VALUE', expr.value)}</block>`;
  }

  // Incremento/decremento como sentencia: i++, i--
  if (expr.type === 'unop' && /\+\+|--/.test(expr.op)) {
    const name = expr.operand?.name || 'i';
    const op   = expr.op.includes('++') ? 'ADD' : 'MINUS';
    return `<block type="arduino_variable_set" id="${nid()}"><field name="NAME">${esc(name)}</field><value name="VALUE"><block type="math_arithmetic" id="${nid()}"><field name="OP">${op}</field>${valueWrap('A',{type:'ident',name})}${valueWrap('B',{type:'num',value:1})}</block></value></block>`;
  }

  if (expr.type !== 'call') return '';

  const { name, args } = expr;

  switch (name) {
    case 'pinMode':
      return `<block type="arduino_pin_mode" id="${nid()}"><field name="MODE">${modeArg(args[1])}</field>${pinValue('PIN', args[0], 13)}</block>`;

    case 'digitalWrite':
      return `<block type="arduino_digital_write" id="${nid()}">${pinValue('PIN', args[0], 13)}${digitalStateValue(args[1])}</block>`;

    case 'analogWrite':
      return `<block type="arduino_analog_write" id="${nid()}">${pinValue('PIN', args[0], 9)}${valueWrap('VALUE', args[1])}</block>`;

    case 'delay':
      return `<block type="arduino_delay" id="${nid()}">${valueWrap('MS', args[0])}</block>`;

    case 'delayMicroseconds':
      return `<block type="arduino_delay_microseconds" id="${nid()}">${valueWrap('US', args[0])}</block>`;

    case 'Serial.begin':
      return `<block type="arduino_serial_begin" id="${nid()}"><field name="BAUD">${clampBaud(numArg(args[0], 9600))}</field></block>`;

    case 'Serial.print':
      return `<block type="arduino_serial_print" id="${nid()}">${valueWrap('TEXT', args[0])}</block>`;

    case 'tone':
      if (args.length >= 3) {
        return `<block type="arduino_tone_duration" id="${nid()}">${pinValue('PIN', args[0], 8)}${valueWrap('FREQ', args[1])}${valueWrap('DURATION', args[2])}</block>`;
      }
      return `<block type="arduino_tone" id="${nid()}">${pinValue('PIN', args[0], 8)}${valueWrap('FREQ', args[1])}</block>`;

    case 'noTone':
      return `<block type="arduino_no_tone" id="${nid()}">${pinValue('PIN', args[0], 8)}</block>`;

    case 'randomSeed':
      return `<block type="arduino_random_seed" id="${nid()}">${valueWrap('SEED', args[0])}</block>`;

    case 'analogReference':
      return `<block type="arduino_analog_reference" id="${nid()}"><field name="REF">${esc(identArg(args[0], 'DEFAULT'))}</field></block>`;

    case 'interrupts':
    case 'noInterrupts':
      return `<block type="arduino_interrupts_toggle" id="${nid()}"><field name="ACTION">${name}</field></block>`;

    case 'Serial.write':
      return `<block type="arduino_serial_write" id="${nid()}">${valueWrap('DATA', args[0])}</block>`;

    case 'Serial.flush':
    case 'Serial.end':
      return `<block type="arduino_serial_action" id="${nid()}"><field name="ACTION">${esc(name.slice(7))}</field></block>`;

    case 'Serial.println':
      if (!args.length) return `<block type="arduino_serial_println_empty" id="${nid()}"></block>`;
      return `<block type="arduino_serial_println" id="${nid()}">${valueWrap('TEXT', args[0])}</block>`;

    case 'bitWrite':
      return `<block type="arduino_bit_write" id="${nid()}"><field name="NAME">${esc(identArg(args[0], 'miVariable'))}</field>${valueWrap('BIT', args[1])}${valueWrap('VALUE', args[2])}</block>`;

    case 'bitSet':
    case 'bitClear':
      return `<block type="arduino_bit_set_clear" id="${nid()}"><field name="FN">${name}</field><field name="NAME">${esc(identArg(args[0], 'miVariable'))}</field>${valueWrap('BIT', args[1])}</block>`;

    case 'shiftOut':
      return `<block type="arduino_shift_out" id="${nid()}"><field name="ORDER">${esc(identArg(args[2], 'MSBFIRST'))}</field>${pinValue('DATA', args[0], 11)}${pinValue('CLOCK', args[1], 12)}${valueWrap('VALUE', args[3])}</block>`;

    default:
      // Llamada desconocida → bloque «llamar» conservando los argumentos originales
      return `<block type="arduino_function_call" id="${nid()}"><field name="NAME">${esc(name)}</field><field name="ARGS">${esc(argsToC(args))}</field></block>`;
  }
}

function modeArg(expr) {
  const name = identArg(expr, 'OUTPUT').toUpperCase();
  if (name === 'INPUT') return 'INPUT';
  if (name === 'INPUT_PULLUP') return 'INPUT_PULLUP';
  return 'OUTPUT';
}

/**
 * Renderiza una expresión del AST de vuelta a C++.
 * Se usa para conservar los argumentos de llamadas que no tienen bloque propio
 * (p. ej. `lcd.setCursor(0, 1)` → bloque «llamar» con ARGS = "0, 1").
 */
export function exprToC(expr) {
  if (!expr) return '';
  switch (expr.type) {
    case 'num':   return String(expr.value);
    case 'str':   return `"${String(expr.value).replace(/"/g, '\\"')}"`;
    case 'bool':  return expr.value ? 'true' : 'false';
    case 'ident': return expr.name;
    case 'binop': return `${exprToC(expr.left)} ${expr.op} ${exprToC(expr.right)}`;
    case 'unop': {
      const operand = exprToC(expr.operand);
      if (expr.op === 'neg')    return `-${operand}`;
      if (expr.op === '++post') return `${operand}++`;
      if (expr.op === '--post') return `${operand}--`;
      if (expr.op === '++pre')  return `++${operand}`;
      if (expr.op === '--pre')  return `--${operand}`;
      return `${expr.op}${operand}`;
    }
    case 'assign': return `${exprToC(expr.target)} ${expr.op} ${exprToC(expr.value)}`;
    case 'call':   return `${expr.name}(${(expr.args || []).map(exprToC).join(', ')})`;
    default:       return '';
  }
}

/** Argumentos de una llamada renderizados como texto C separados por comas */
function argsToC(args) {
  return (args || []).map(exprToC).filter((s) => s !== '').join(', ');
}

// ─── Punto de entrada ────────────────────────────────────────────────────────

/**
 * Convierte código Arduino C++ en XML de Blockly.
 * Retorna null si el código no tiene void setup() / void loop() ni tiene errores.
 */
export function codeToXML(code) {
  _id = 0;
  const ast = parseArduinoCode(code);
  if (ast.error) return null;

  const hasFunctions = ast.functions && ast.functions.length > 0;

  // Si no hay setup, loop ni funciones, no actualizar los bloques
  if (ast.setup.length === 0 && ast.loop.length === 0 && !hasFunctions) return null;

  // Normalizar tipo de retorno al dropdown del bloque
  const RET_MAP = {
    'void':'void','int':'int','float':'float','bool':'bool','boolean':'bool',
    'String':'String','long':'long','byte':'byte','double':'float',
    'short':'int','char':'byte','unsigned int':'int','unsigned long':'long',
  };
  function normalizeRetType(t) {
    const s = (t || 'void').trim();
    return RET_MAP[s] || RET_MAP[s.split(' ').pop()] || 'void';
  }

  // Generar bloques de funciones personalizadas
  let funcBlocksXml = '';
  let yOffset = 220;
  for (const fn of (ast.functions || [])) {
    const bodyXml = chain(fn.body.map(stmtBlock));
    const retType = normalizeRetType(fn.retType);
    const paramsField = fn.params ? `\n    <field name="PARAMS">${esc(fn.params)}</field>` : '';
    funcBlocksXml += `\n  <block type="arduino_function_define" id="${nid()}" x="500" y="${yOffset}">
    <field name="RETURN_TYPE">${esc(retType)}</field>
    <field name="NAME">${esc(fn.name)}</field>${paramsField}
    <statement name="BODY">${bodyXml}</statement>
  </block>`;
    yOffset += 220;
  }

  // Generar bloques de #include
  let includeBlocksXml = '';
  let includeY = 20;
  for (const lib of (ast.includes || [])) {
    includeBlocksXml += `\n  <block type="arduino_include" id="${nid()}" x="-280" y="${includeY}">
    <field name="LIB">${esc(lib)}</field>
  </block>`;
    includeY += 60;
  }

  // Generar bloques globales flotantes (variables, arrays, defines)
  let globalBlocksXml = '';
  let globalY = 20;
  const globalTypeOpts = ['int','float','bool','String','long','byte'];
  const arrTypeOpts    = ['int','float','byte','bool'];
  for (const g of (ast.globals || [])) {
    if (g.type === 'vardecl') {
      const base = (g.varType || 'int').replace(/^(?:const|static)\s+/, '');
      const t = globalTypeOpts.includes(base) ? base : 'int';
      globalBlocksXml += `\n  <block type="arduino_global_variable_declare" id="${nid()}" x="-500" y="${globalY}">
    <field name="TYPE">${esc(t)}</field>
    <field name="NAME">${esc(g.name)}</field>
    ${valueWrap('VALUE', g.value || { type: 'num', value: 0 })}
  </block>`;
      globalY += 65;
    } else if (g.type === 'arraydecl') {
      const base = (g.varType || 'int').replace(/^(?:const|static)\s+/, '');
      const t = arrTypeOpts.includes(base) ? base : (arrTypeOpts.includes(base.split(' ').pop()) ? base.split(' ').pop() : 'int');
      const size = g.size?.type === 'num' ? g.size.value : (g.items?.length || 10);
      globalBlocksXml += `\n  <block type="arduino_array_declare" id="${nid()}" x="-500" y="${globalY}">
    <field name="TYPE">${esc(t)}</field>
    <field name="NAME">${esc(g.name)}</field>
    <field name="SIZE">${esc(size)}</field>
  </block>`;
      globalY += 65;
    } else if (g.type === 'define') {
      globalBlocksXml += `\n  <block type="arduino_define" id="${nid()}" x="-500" y="${globalY}">
    <field name="NAME">${esc(g.name)}</field>
    <field name="VALUE">${esc(g.value)}</field>
  </block>`;
      globalY += 65;
    }
  }

  const setupXml = chain(ast.setup.map(stmtBlock));
  const loopXml  = chain(ast.loop.map(stmtBlock));

  return `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_setup_loop" id="${nid()}" x="20" y="20">
    <statement name="SETUP">${setupXml}</statement>
    <statement name="LOOP">${loopXml}</statement>
  </block>${funcBlocksXml}${includeBlocksXml}${globalBlocksXml}
</xml>`;
}
