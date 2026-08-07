import * as Blockly from 'blockly';

// ──────────────────────────────────────────────
// Validadores de campos compartidos
// ──────────────────────────────────────────────

/**
 * Valida un pin escrito a mano: número 0-53 o un identificador C válido
 * (permite usar constantes y variables como número de pin).
 * Se mantiene para los bloques que siguen usando campo de texto (modo Niño).
 */
export function pinFieldValidator(value) {
  const v = String(value ?? '').trim();
  if (!v) return '13';

  if (/^\d+$/.test(v)) {
    const n = Number(v);
    if (n < 0 || n > 53) return null;
    return String(n);
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)) return v;
  return null;
}

/** Palabras reservadas de C/C++ que no pueden usarse como nombre de variable */
export const RESERVED_WORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long',
  'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
  'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', 'bool', 'boolean',
  'true', 'false', 'class', 'new', 'delete', 'this', 'public', 'private', 'protected',
  'namespace', 'template', 'try', 'catch', 'throw', 'operator', 'virtual', 'friend',
  'setup', 'loop', 'String', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP',
]);

/**
 * Normaliza el nombre de una variable/función a un identificador C válido.
 * - Recorta espacios y reemplaza caracteres inválidos por «_»
 * - Antepone «_» si empieza por dígito
 * - Rechaza (devuelve null → Blockly revierte) nombres vacíos o reservados
 * @param {string} value
 * @returns {string|null}
 */
export function nameFieldValidator(value) {
  let v = String(value ?? '').trim();
  if (!v) return null;

  // Sustituir cualquier carácter no permitido en un identificador C
  v = v.replace(/[^A-Za-z0-9_]/g, '_');
  if (/^\d/.test(v)) v = '_' + v;
  if (RESERVED_WORDS.has(v)) return null;
  return v;
}

/**
 * Validador permisivo para *referencias* a algo ya declarado
 * (`miVar`, `sensor.valor`, `Wire::read`, `datos[0]`).
 * Solo limpia caracteres imposibles en C; no rechaza palabras reservadas
 * porque una referencia puede ser un miembro (`obj.String`).
 * @param {string} value
 * @returns {string|null}
 */
export function referenceFieldValidator(value) {
  const v = String(value ?? '').trim();
  if (!v) return null;
  return v.replace(/[^A-Za-z0-9_.:[\]]/g, '_');
}

/** Campo de texto para nombres declarados (variables, funciones), con validación C estricta */
export function nameField(defaultName) {
  return new Blockly.FieldTextInput(defaultName, nameFieldValidator);
}

/** Campo de texto para referencias a variables/funciones existentes */
export function refField(defaultName) {
  return new Blockly.FieldTextInput(defaultName, referenceFieldValidator);
}

/** Tipos de dato C/C++ disponibles en los desplegables de declaración */
export const C_TYPES = [
  ['int', 'int'],
  ['unsigned int', 'unsigned int'],
  ['long', 'long'],
  ['unsigned long', 'unsigned long'],
  ['float', 'float'],
  ['double', 'double'],
  ['bool', 'bool'],
  ['char', 'char'],
  ['byte', 'byte'],
  ['String', 'String'],
  ['short', 'short'],
  ['uint8_t', 'uint8_t'],
  ['int8_t', 'int8_t'],
  ['uint16_t', 'uint16_t'],
  ['int16_t', 'int16_t'],
  ['uint32_t', 'uint32_t'],
  ['int32_t', 'int32_t'],
];

/** Tipos válidos para arrays */
export const ARRAY_TYPES = [
  ['int', 'int'], ['float', 'float'], ['byte', 'byte'], ['bool', 'bool'],
  ['char', 'char'], ['long', 'long'], ['unsigned int', 'unsigned int'], ['String', 'String'],
];

/** Pines analógicos A0..A15 como opciones de desplegable */
export const ANALOG_PINS = Array.from({ length: 16 }, (_, i) => [`A${i}`, `A${i}`]);

// ──────────────────────────────────────────────
// Definición de bloques Arduino personalizados
// ──────────────────────────────────────────────

export function defineArduinoBlocks() {

  // ── Setup / Loop ──────────────────────────────
  Blockly.Blocks['arduino_setup_loop'] = {
    init() {
      this.appendStatementInput('SETUP')
        .setCheck(null)
        .appendField('⚙️ setup()');
      this.appendStatementInput('LOOP')
        .setCheck(null)
        .appendField('🔁 loop()');
      this.setColour(210);
      this.setTooltip('Estructura principal del sketch Arduino');
      this.setDeletable(false);
      this.setMovable(false);
    },
  };

  // ── pinMode ──────────────────────────────────
  Blockly.Blocks['arduino_pin_mode'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('pinMode pin');
      this.appendDummyInput()
        .appendField('modo')
        .appendField(new Blockly.FieldDropdown([
          ['OUTPUT', 'OUTPUT'],
          ['INPUT', 'INPUT'],
          ['INPUT_PULLUP', 'INPUT_PULLUP'],
        ]), 'MODE');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Configura un pin como entrada o salida. El pin acepta números, constantes o variables');
    },
  };

  // ── digitalWrite ─────────────────────────────
  Blockly.Blocks['arduino_digital_write'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('digitalWrite pin');
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('valor');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Escribe HIGH o LOW en un pin digital');
    },
  };

  // ── Estado digital HIGH/LOW (valor enchufable) ─
  Blockly.Blocks['arduino_digital_state'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['HIGH', 'HIGH'],
          ['LOW', 'LOW'],
        ]), 'STATE');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Constante HIGH (1) o LOW (0)');
    },
  };

  // ── Pin analógico A0..A15 (valor enchufable) ──
  Blockly.Blocks['arduino_analog_pin'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(ANALOG_PINS), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Constante de pin analógico (A0…A15)');
    },
  };

  // ── digitalRead ──────────────────────────────
  Blockly.Blocks['arduino_digital_read'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('digitalRead pin');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee el estado de un pin digital (HIGH/LOW)');
    },
  };

  // ── analogWrite (PWM) ────────────────────────
  Blockly.Blocks['arduino_analog_write'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('analogWrite pin');
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('valor');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Escribe un valor PWM (0-255) en un pin');
    },
  };

  // ── analogRead ───────────────────────────────
  Blockly.Blocks['arduino_analog_read'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('analogRead pin');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee un valor analógico (0-1023) de un pin');
    },
  };

  // ── analogReference ──────────────────────────
  Blockly.Blocks['arduino_analog_reference'] = {
    init() {
      this.appendDummyInput()
        .appendField('analogReference')
        .appendField(new Blockly.FieldDropdown([
          ['DEFAULT', 'DEFAULT'],
          ['INTERNAL', 'INTERNAL'],
          ['INTERNAL1V1', 'INTERNAL1V1'],
          ['INTERNAL2V56', 'INTERNAL2V56'],
          ['EXTERNAL', 'EXTERNAL'],
        ]), 'REF');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Selecciona la tensión de referencia para las lecturas analógicas');
    },
  };

  // ── pulseIn ──────────────────────────────────
  Blockly.Blocks['arduino_pulse_in'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('pulseIn pin');
      this.appendDummyInput()
        .appendField('estado')
        .appendField(new Blockly.FieldDropdown([
          ['HIGH', 'HIGH'],
          ['LOW', 'LOW'],
        ]), 'STATE');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Mide la duración de un pulso en microsegundos (usado por HC-SR04)');
    },
  };

  // ── shiftOut ─────────────────────────────────
  Blockly.Blocks['arduino_shift_out'] = {
    init() {
      this.appendValueInput('DATA').setCheck(null).appendField('shiftOut data');
      this.appendValueInput('CLOCK').setCheck(null).appendField('clock');
      this.appendDummyInput()
        .appendField('orden')
        .appendField(new Blockly.FieldDropdown([
          ['MSBFIRST', 'MSBFIRST'],
          ['LSBFIRST', 'LSBFIRST'],
        ]), 'ORDER');
      this.appendValueInput('VALUE').setCheck('Number').appendField('valor');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Envía un byte bit a bit (registros de desplazamiento 74HC595)');
    },
  };

  // ── shiftIn ──────────────────────────────────
  Blockly.Blocks['arduino_shift_in'] = {
    init() {
      this.appendValueInput('DATA').setCheck(null).appendField('shiftIn data');
      this.appendValueInput('CLOCK').setCheck(null).appendField('clock');
      this.appendDummyInput()
        .appendField('orden')
        .appendField(new Blockly.FieldDropdown([
          ['MSBFIRST', 'MSBFIRST'],
          ['LSBFIRST', 'LSBFIRST'],
        ]), 'ORDER');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee un byte bit a bit desde un registro de desplazamiento');
    },
  };

  // ── attachInterrupt / detachInterrupt ────────
  Blockly.Blocks['arduino_attach_interrupt'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('attachInterrupt pin');
      this.appendDummyInput()
        .appendField('función')
        .appendField(nameField('miISR'), 'ISR')
        .appendField('modo')
        .appendField(new Blockly.FieldDropdown([
          ['CHANGE', 'CHANGE'],
          ['RISING', 'RISING'],
          ['FALLING', 'FALLING'],
          ['LOW', 'LOW'],
        ]), 'MODE');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Asocia una función a una interrupción de hardware');
    },
  };

  Blockly.Blocks['arduino_detach_interrupt'] = {
    init() {
      this.appendValueInput('PIN')
        .setCheck(null)
        .appendField('detachInterrupt pin');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Desactiva la interrupción asociada a un pin');
    },
  };

  Blockly.Blocks['arduino_interrupts_toggle'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['interrupts()', 'interrupts'],
          ['noInterrupts()', 'noInterrupts'],
        ]), 'ACTION');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Habilita o deshabilita globalmente las interrupciones');
    },
  };

  // ── delay ────────────────────────────────────
  Blockly.Blocks['arduino_delay'] = {
    init() {
      this.appendValueInput('MS')
        .setCheck('Number')
        .appendField('delay (ms)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Pausa la ejecución por X milisegundos');
    },
  };

  // ── delayMicroseconds ────────────────────────
  Blockly.Blocks['arduino_delay_microseconds'] = {
    init() {
      this.appendValueInput('US')
        .setCheck('Number')
        .appendField('delayMicroseconds (µs)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Pausa la ejecución por X microsegundos');
    },
  };

  // ── Serial.begin ─────────────────────────────
  Blockly.Blocks['arduino_serial_begin'] = {
    init() {
      this.appendDummyInput()
        .appendField('Serial.begin')
        .appendField(new Blockly.FieldDropdown([
          ['9600', '9600'],
          ['115200', '115200'],
          ['57600', '57600'],
          ['38400', '38400'],
          ['19200', '19200'],
        ]), 'BAUD');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Inicializa comunicación serial');
    },
  };

  // ── Serial.println ───────────────────────────
  Blockly.Blocks['arduino_serial_println'] = {
    init() {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('Serial.println');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Imprime en el monitor serial con salto de línea');
    },
  };

  // ── Serial.print ─────────────────────────────
  Blockly.Blocks['arduino_serial_print'] = {
    init() {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('Serial.print');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Imprime en el monitor serial sin salto de línea');
    },
  };

  // ── Serial.print con base numérica ───────────
  Blockly.Blocks['arduino_serial_print_base'] = {
    init() {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['Serial.print', 'print'],
          ['Serial.println', 'println'],
        ]), 'MODE');
      this.appendDummyInput()
        .appendField('en')
        .appendField(new Blockly.FieldDropdown([
          ['decimal (DEC)', 'DEC'],
          ['hexadecimal (HEX)', 'HEX'],
          ['binario (BIN)', 'BIN'],
          ['octal (OCT)', 'OCT'],
        ]), 'BASE');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Imprime un número en la base indicada');
    },
  };

  // ── Serial.println() sin argumentos ──────────
  Blockly.Blocks['arduino_serial_println_empty'] = {
    init() {
      this.appendDummyInput().appendField('Serial.println()  (línea vacía)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Imprime solo un salto de línea');
    },
  };

  // ── Serial.write ─────────────────────────────
  Blockly.Blocks['arduino_serial_write'] = {
    init() {
      this.appendValueInput('DATA')
        .setCheck(null)
        .appendField('Serial.write');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Envía datos binarios (bytes) por el puerto serie');
    },
  };

  // ── Serial: flush / end / peek ───────────────
  Blockly.Blocks['arduino_serial_action'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['Serial.flush()', 'flush'],
          ['Serial.end()', 'end'],
        ]), 'ACTION');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Vacía el buffer de salida o cierra el puerto serie');
    },
  };

  // ── Serial: lecturas que devuelven valor ─────
  Blockly.Blocks['arduino_serial_read_value'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['Serial.parseInt()', 'parseInt'],
          ['Serial.parseFloat()', 'parseFloat'],
          ['Serial.peek()', 'peek'],
          ['Serial.readString()', 'readString'],
        ]), 'FN');
      this.setOutput(true, null);
      this.setColour(65);
      this.setTooltip('Lee un valor del puerto serie');
    },
  };

  Blockly.Blocks['arduino_serial_read_string_until'] = {
    init() {
      this.appendDummyInput()
        .appendField('Serial.readStringUntil')
        .appendField(new Blockly.FieldTextInput('\\n'), 'CHAR');
      this.setOutput(true, 'String');
      this.setColour(65);
      this.setTooltip('Lee del serie hasta encontrar el carácter indicado');
    },
  };

  // ── Serial.available ───────────────────────────
  Blockly.Blocks['arduino_serial_available'] = {
    init() {
      this.appendDummyInput().appendField('Serial.available()');
      this.setOutput(true, 'Number');
      this.setColour(65);
      this.setTooltip('Retorna el número de bytes disponibles para leer del Serial');
    },
  };

  // ── Serial.read ────────────────────────────────
  Blockly.Blocks['arduino_serial_read'] = {
    init() {
      this.appendDummyInput().appendField('Serial.read()');
      this.setOutput(true, 'Number');
      this.setColour(65);
      this.setTooltip('Lee el primer byte disponible del Serial (-1 si no hay datos)');
    },
  };

  // ── Variable ─────────────────────────────────
  Blockly.Blocks['arduino_variable_declare'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown(C_TYPES), 'TYPE')
        .appendField(nameField('miVariable'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Declara e inicializa una variable local');
    },
  };

  // ── Variable get ─────────────────────────────
  Blockly.Blocks['arduino_variable_get'] = {
    init() {
      this.appendDummyInput()
        .appendField(refField('miVariable'), 'NAME');
      this.setOutput(true, null);
      this.setColour(330);
      this.setTooltip('Obtiene el valor de una variable. Se puede enchufar en cualquier hueco de valor');
    },
  };

  // ── Variable set ─────────────────────────────
  Blockly.Blocks['arduino_variable_set'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(refField('miVariable'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Asigna un valor a una variable existente');
    },
  };

  // ── Asignación compuesta (+=, -=, …) ─────────
  Blockly.Blocks['arduino_compound_assign'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(refField('miVariable'), 'NAME')
        .appendField(new Blockly.FieldDropdown([
          ['+=', '+='], ['-=', '-='], ['*=', '*='], ['/=', '/='], ['%=', '%='],
          ['&=', '&='], ['|=', '|='], ['^=', '^='], ['<<=', '<<='], ['>>=', '>>='],
        ]), 'OP');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Operación y asignación combinadas (x += 1)');
    },
  };

  // ── Incremento / decremento ──────────────────
  Blockly.Blocks['arduino_increment'] = {
    init() {
      this.appendDummyInput()
        .appendField(refField('i'), 'NAME')
        .appendField(new Blockly.FieldDropdown([
          ['++ (sumar 1)', '++'],
          ['-- (restar 1)', '--'],
        ]), 'OP');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Incrementa o decrementa una variable en 1');
    },
  };

  // ── if / else ────────────────────────────────
  Blockly.Blocks['arduino_if_simple'] = {
    init() {
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('si');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('entonces');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Condicional if sin else');
    },
  };

  Blockly.Blocks['arduino_if'] = {
    init() {
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('if');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('entonces');
      this.appendStatementInput('ELSE')
        .setCheck(null)
        .appendField('si no');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Estructura condicional if/else');
    },
  };

  // ── if / else if / else ──────────────────────
  Blockly.Blocks['arduino_if_else_if'] = {
    init() {
      this.appendValueInput('IF0').setCheck('Boolean').appendField('if');
      this.appendStatementInput('DO0').setCheck(null).appendField('entonces');
      this.appendValueInput('IF1').setCheck('Boolean').appendField('si no si');
      this.appendStatementInput('DO1').setCheck(null).appendField('entonces');
      this.appendStatementInput('ELSE').setCheck(null).appendField('si no');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Cadena if / else if / else');
    },
  };

  // ── Operador ternario ────────────────────────
  Blockly.Blocks['arduino_ternary'] = {
    init() {
      this.appendValueInput('COND').setCheck('Boolean').appendField('si');
      this.appendValueInput('THEN').setCheck(null).appendField('? entonces');
      this.appendValueInput('ELSE').setCheck(null).appendField(': si no');
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip('Operador condicional: cond ? valorSi : valorNo');
    },
  };

  // ── for loop ─────────────────────────────────
  Blockly.Blocks['arduino_for'] = {
    init() {
      this.appendDummyInput()
        .appendField('for')
        .appendField(nameField('i'), 'VAR');
      this.appendValueInput('FROM').setCheck('Number').appendField('de');
      this.appendValueInput('TO').setCheck('Number').appendField('hasta');
      this.appendValueInput('STEP').setCheck('Number').appendField('paso');
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Bucle for con contador. Los límites aceptan variables');
    },
  };

  // ── while loop ───────────────────────────────
  Blockly.Blocks['arduino_while'] = {
    init() {
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('while');
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Bucle while');
    },
  };

  // ── map ──────────────────────────────────────
  Blockly.Blocks['arduino_map'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Number').appendField('map(');
      this.appendValueInput('FROM_LOW').setCheck('Number').appendField('de');
      this.appendValueInput('FROM_HIGH').setCheck('Number').appendField('a');
      this.appendValueInput('TO_LOW').setCheck('Number').appendField('→');
      this.appendValueInput('TO_HIGH').setCheck('Number').appendField('a');
      this.appendDummyInput().appendField(')');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Mapea un valor de un rango a otro');
    },
  };

  // ── constrain ────────────────────────────────
  Blockly.Blocks['arduino_constrain'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Number').appendField('constrain(');
      this.appendValueInput('MIN').setCheck('Number').appendField('min');
      this.appendValueInput('MAX').setCheck('Number').appendField('max )');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Limita un valor entre un mínimo y máximo');
    },
  };

  // ── min / max ────────────────────────────────
  Blockly.Blocks['arduino_min_max'] = {
    init() {
      this.appendValueInput('A')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['min', 'min'], ['max', 'max'],
        ]), 'FN');
      this.appendValueInput('B').setCheck('Number').appendField(',');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Devuelve el menor o el mayor de dos números');
    },
  };

  // ── random / randomSeed ──────────────────────
  Blockly.Blocks['arduino_random'] = {
    init() {
      this.appendValueInput('MIN').setCheck('Number').appendField('random desde');
      this.appendValueInput('MAX').setCheck('Number').appendField('hasta (excl.)');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Número pseudoaleatorio en [min, max)');
    },
  };

  Blockly.Blocks['arduino_random_seed'] = {
    init() {
      this.appendValueInput('SEED').setCheck('Number').appendField('randomSeed');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Inicializa el generador aleatorio (usa analogRead de un pin libre)');
    },
  };

  // ── % módulo (resto de división) ──────────────
  Blockly.Blocks['arduino_modulo'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendValueInput('B')
        .setCheck('Number')
        .appendField('% (resto de)');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Calcula el resto de la división entre dos números (operador %)');
    },
  };

  // ── Operadores bit a bit (&, |, ^, <<, >>) ────
  Blockly.Blocks['arduino_bitwise'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['AND (&)', '&'],
          ['OR (|)', '|'],
          ['XOR (^)', '^'],
          ['Desplazar izq. (<<)', '<<'],
          ['Desplazar der. (>>)', '>>'],
        ]), 'OP');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Operación a nivel de bits: AND, OR, XOR o desplazamiento de bits');
    },
  };

  // ── NOT bit a bit (~) ─────────────────────────
  Blockly.Blocks['arduino_bitwise_not'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('~ (NOT bit a bit)');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Invierte todos los bits de un número (complemento a uno, operador ~)');
    },
  };

  // ── bitRead ──────────────────────────────────
  Blockly.Blocks['arduino_bit_read'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Number').appendField('bitRead valor');
      this.appendValueInput('BIT').setCheck('Number').appendField('bit');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Lee el bit n de un número (0 = bit menos significativo)');
    },
  };

  // ── bitWrite ─────────────────────────────────
  Blockly.Blocks['arduino_bit_write'] = {
    init() {
      this.appendDummyInput()
        .appendField('bitWrite en')
        .appendField(refField('miVariable'), 'NAME');
      this.appendValueInput('BIT').setCheck('Number').appendField('bit');
      this.appendValueInput('VALUE').setCheck('Number').appendField('=');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Escribe 0 o 1 en el bit n de una variable');
    },
  };

  // ── bitSet / bitClear ────────────────────────
  Blockly.Blocks['arduino_bit_set_clear'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['bitSet (poner a 1)', 'bitSet'],
          ['bitClear (poner a 0)', 'bitClear'],
        ]), 'FN')
        .appendField(refField('miVariable'), 'NAME');
      this.appendValueInput('BIT').setCheck('Number').appendField('bit');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Pone a 1 o a 0 el bit n de una variable');
    },
  };

  // ── bit(n) ───────────────────────────────────
  Blockly.Blocks['arduino_bit'] = {
    init() {
      this.appendValueInput('N').setCheck('Number').appendField('bit(');
      this.appendDummyInput().appendField(')');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Devuelve 2^n — el valor del bit n');
    },
  };

  // ── lowByte / highByte ───────────────────────
  Blockly.Blocks['arduino_byte_part'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['lowByte', 'lowByte'], ['highByte', 'highByte'],
        ]), 'FN');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Byte bajo o alto de un valor de 16 bits');
    },
  };

  // ── Conversión de tipo (cast) ────────────────
  Blockly.Blocks['arduino_cast'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('convertir a')
        .appendField(new Blockly.FieldDropdown([
          ['int', 'int'], ['long', 'long'], ['float', 'float'], ['double', 'double'],
          ['byte', 'byte'], ['char', 'char'], ['bool', 'bool'],
          ['unsigned int', 'unsigned int'], ['unsigned long', 'unsigned long'],
        ]), 'TYPE');
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip('Cast de C: (int)valor');
    },
  };

  // ── sizeof ───────────────────────────────────
  Blockly.Blocks['arduino_sizeof'] = {
    init() {
      this.appendDummyInput()
        .appendField('sizeof(')
        .appendField(refField('miArray'), 'NAME')
        .appendField(')');
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Tamaño en bytes de una variable, array o tipo');
    },
  };

  // ── millis ───────────────────────────────────
  Blockly.Blocks['arduino_millis'] = {
    init() {
      this.appendDummyInput().appendField('millis()');
      this.setOutput(true, 'Number');
      this.setColour(120);
      this.setTooltip('Retorna el tiempo en milisegundos desde el inicio');
    },
  };

  // ── tone ─────────────────────────────────────
  Blockly.Blocks['arduino_tone'] = {
    init() {
      this.appendValueInput('PIN').setCheck(null).appendField('tone pin');
      this.appendValueInput('FREQ').setCheck('Number').appendField('frecuencia');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Genera un tono en un pin');
    },
  };

  // ── tone con duración ────────────────────────
  Blockly.Blocks['arduino_tone_duration'] = {
    init() {
      this.appendValueInput('PIN').setCheck(null).appendField('tone pin');
      this.appendValueInput('FREQ').setCheck('Number').appendField('frecuencia');
      this.appendValueInput('DURATION').setCheck('Number').appendField('durante (ms)');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Genera un tono durante un tiempo determinado');
    },
  };

  // ── noTone ───────────────────────────────────
  Blockly.Blocks['arduino_no_tone'] = {
    init() {
      this.appendValueInput('PIN').setCheck(null).appendField('noTone pin');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Detiene el tono en un pin');
    },
  };

  // ── Comentario ───────────────────────────────
  Blockly.Blocks['arduino_comment'] = {
    init() {
      this.appendDummyInput()
        .appendField('// ')
        .appendField(new Blockly.FieldTextInput('comentario'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
      this.setTooltip('Agrega un comentario al código');
    },
  };

  // ── Comentario de bloque ─────────────────────
  Blockly.Blocks['arduino_block_comment'] = {
    init() {
      this.appendDummyInput()
        .appendField('/* ')
        .appendField(new Blockly.FieldTextInput('comentario de bloque'), 'TEXT')
        .appendField(' */');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
      this.setTooltip('Comentario multilínea /* … */');
    },
  };

  // ── Código libre (sentencia) ─────────────────
  Blockly.Blocks['arduino_raw_statement'] = {
    init() {
      this.appendDummyInput()
        .appendField('⌨️ código')
        .appendField(new Blockly.FieldTextInput('digitalWrite(13, HIGH);'), 'CODE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
      this.setTooltip('Escribe una línea de C/C++ tal cual. Útil para APIs no cubiertas por bloques');
    },
  };

  // ── Código libre (expresión) ─────────────────
  Blockly.Blocks['arduino_raw_expression'] = {
    init() {
      this.appendDummyInput()
        .appendField('⌨️ valor')
        .appendField(new Blockly.FieldTextInput('analogRead(A0)'), 'CODE');
      this.setOutput(true, null);
      this.setColour(45);
      this.setTooltip('Expresión C/C++ escrita a mano que devuelve un valor');
    },
  };

  // ── Comparación ──────────────────────────────
  Blockly.Blocks['arduino_compare'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['==', '=='], ['!=', '!='],
          ['<', '<'], ['<=', '<='],
          ['>', '>'], ['>=', '>='],
        ]), 'OP');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(210);
      this.setTooltip('Compara dos valores');
    },
  };

  // ── Operación lógica ─────────────────────────
  Blockly.Blocks['arduino_logic'] = {
    init() {
      this.appendValueInput('A').setCheck('Boolean');
      this.appendValueInput('B')
        .setCheck('Boolean')
        .appendField(new Blockly.FieldDropdown([
          ['AND (&&)', '&&'],
          ['OR (||)', '||'],
        ]), 'OP');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(210);
      this.setTooltip('Operación lógica AND/OR');
    },
  };

  // ── NOT ──────────────────────────────────────
  Blockly.Blocks['arduino_not'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Boolean').appendField('NOT');
      this.setOutput(true, 'Boolean');
      this.setColour(210);
      this.setTooltip('Niega una condición booleana');
    },
  };

  // ── Texto: carácter literal ──────────────────
  Blockly.Blocks['arduino_char'] = {
    init() {
      this.appendDummyInput()
        .appendField("carácter '")
        .appendField(new Blockly.FieldTextInput('A', (v) => String(v ?? '').slice(0, 1) || 'A'), 'CHAR')
        .appendField("'");
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip("Literal de carácter C: 'A'");
    },
  };

  // ── String(x) ────────────────────────────────
  Blockly.Blocks['arduino_string_cast'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('String(');
      this.appendDummyInput().appendField(')');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour(160);
      this.setTooltip('Convierte un valor en texto (String)');
    },
  };

  // ── length() ─────────────────────────────────
  Blockly.Blocks['arduino_string_length'] = {
    init() {
      this.appendValueInput('STR').setCheck(null).appendField('longitud de');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Número de caracteres de un String');
    },
  };

  // ── Concatenar ───────────────────────────────
  Blockly.Blocks['arduino_string_concat'] = {
    init() {
      this.appendValueInput('A').setCheck(null).appendField('unir');
      this.appendValueInput('B').setCheck(null).appendField('con');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour(160);
      this.setTooltip('Concatena dos textos');
    },
  };

  // ── substring ────────────────────────────────
  Blockly.Blocks['arduino_string_substring'] = {
    init() {
      this.appendValueInput('STR').setCheck(null).appendField('subcadena de');
      this.appendValueInput('FROM').setCheck('Number').appendField('desde');
      this.appendValueInput('TO').setCheck('Number').appendField('hasta');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour(160);
      this.setTooltip('Porción de un String entre dos índices');
    },
  };

  // ── indexOf ──────────────────────────────────
  Blockly.Blocks['arduino_string_index_of'] = {
    init() {
      this.appendValueInput('STR').setCheck(null).appendField('posición en');
      this.appendValueInput('SUB').setCheck(null).appendField('de');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Índice de la primera aparición (-1 si no está)');
    },
  };

  // ── charAt ───────────────────────────────────
  Blockly.Blocks['arduino_string_char_at'] = {
    init() {
      this.appendValueInput('STR').setCheck(null).appendField('carácter de');
      this.appendValueInput('INDEX').setCheck('Number').appendField('en posición');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Carácter en la posición indicada del String');
    },
  };

  // ── toInt / toFloat ──────────────────────────
  Blockly.Blocks['arduino_string_to_number'] = {
    init() {
      this.appendValueInput('STR')
        .setCheck(null)
        .appendField('convertir texto');
      this.appendDummyInput()
        .appendField('a')
        .appendField(new Blockly.FieldDropdown([
          ['entero (toInt)', 'toInt'],
          ['decimal (toFloat)', 'toFloat'],
        ]), 'FN');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Convierte un String en número');
    },
  };

  // ── toUpperCase / toLowerCase / trim ─────────
  Blockly.Blocks['arduino_string_transform'] = {
    init() {
      this.appendValueInput('STR')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['mayúsculas', 'toUpperCase'],
          ['minúsculas', 'toLowerCase'],
          ['sin espacios', 'trim'],
        ]), 'FN')
        .appendField('de');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Transforma un String en el sitio (modifica la variable)');
    },
  };

  // ── Comparación de texto ─────────────────────
  Blockly.Blocks['arduino_string_compare'] = {
    init() {
      this.appendValueInput('A').setCheck(null).appendField('texto');
      this.appendValueInput('B')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['es igual a', 'equals'],
          ['es igual (ignora mayús.) a', 'equalsIgnoreCase'],
          ['empieza por', 'startsWith'],
          ['termina en', 'endsWith'],
        ]), 'FN');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(160);
      this.setTooltip('Compara dos textos');
    },
  };

  // ── Clasificación de caracteres ──────────────
  Blockly.Blocks['arduino_char_check'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['es dígito', 'isDigit'],
          ['es letra', 'isAlpha'],
          ['es alfanumérico', 'isAlphaNumeric'],
          ['es espacio', 'isSpace'],
          ['es mayúscula', 'isUpperCase'],
          ['es minúscula', 'isLowerCase'],
          ['es puntuación', 'isPunct'],
        ]), 'FN');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(160);
      this.setTooltip('Comprueba el tipo de un carácter');
    },
  };

  // ── Definición de función personalizada ──────
  Blockly.Blocks['arduino_function_define'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['void',   'void'],
          ['int',    'int'],
          ['float',  'float'],
          ['bool',   'bool'],
          ['String', 'String'],
          ['long',   'long'],
          ['byte',   'byte'],
          ['char',   'char'],
          ['double', 'double'],
          ['unsigned int',  'unsigned int'],
          ['unsigned long', 'unsigned long'],
        ]), 'RETURN_TYPE')
        .appendField(nameField('miFuncion'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'PARAMS')
        .appendField(')');
      this.appendStatementInput('BODY').setCheck(null);
      this.setColour(270);
      this.setTooltip('Define una función. Escribe los parámetros en el campo PARAMS (ej: int a, float b)');
      this.setHelpUrl('');
    },
  };

  // ── Return con valor ──────────────────────────
  Blockly.Blocks['arduino_return'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('return');
      this.setPreviousStatement(true, null);
      this.setColour(270);
      this.setTooltip('Retorna un valor de la función');
    },
  };

  // ── Return vacío ──────────────────────────────
  Blockly.Blocks['arduino_return_void'] = {
    init() {
      this.appendDummyInput().appendField('return');
      this.setPreviousStatement(true, null);
      this.setColour(270);
      this.setTooltip('Sale de la función (sin valor)');
    },
  };

  // ── Llamar función (sentencia) ────────────────
  Blockly.Blocks['arduino_function_call'] = {
    init() {
      this.appendDummyInput()
        .appendField('llamar')
        .appendField(refField('miFuncion'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(270);
      this.setTooltip('Llama a una función. Escribe los argumentos en el campo ARGS (ej: 10, x)');
    },
  };

  // ── Llamar función (expresión / retorna valor) ─
  Blockly.Blocks['arduino_function_call_expr'] = {
    init() {
      this.appendDummyInput()
        .appendField(refField('miFuncion'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')');
      this.setOutput(true, null);
      this.setColour(270);
      this.setTooltip('Llama a una función y usa su valor retornado');
    },
  };

  // ── do...while ────────────────────────────────
  Blockly.Blocks['arduino_do_while'] = {
    init() {
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('do');
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('while');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Bucle do...while: ejecuta el cuerpo al menos una vez');
    },
  };

  // ── switch / case ──────────────────────────────
  Blockly.Blocks['arduino_switch_case'] = {
    init() {
      this.appendValueInput('EXPR')
        .setCheck(null)
        .appendField('switch');
      this.appendValueInput('CASE1_VAL')
        .setCheck(null)
        .appendField('case');
      this.appendStatementInput('DO1')
        .setCheck(null);
      this.appendValueInput('CASE2_VAL')
        .setCheck(null)
        .appendField('case');
      this.appendStatementInput('DO2')
        .setCheck(null);
      this.appendStatementInput('DEFAULT')
        .setCheck(null)
        .appendField('default:');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Estructura switch/case con 2 casos y default');
    },
  };

  // ── #include ───────────────────────────────────
  Blockly.Blocks['arduino_include'] = {
    init() {
      this.appendDummyInput()
        .appendField('#include <')
        .appendField(new Blockly.FieldTextInput('Wire'), 'LIB')
        .appendField('.h>');
      this.setColour(200);
      this.setTooltip('Incluye una librería. Arrastra este bloque fuera del Setup/Loop');
    },
  };

  // ── Variable global ─────────────────────────────
  Blockly.Blocks['arduino_global_variable_declare'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('global')
        .appendField(new Blockly.FieldDropdown([
          ['—', ''],
          ['static', 'static'],
          ['volatile', 'volatile'],
        ]), 'STORAGE')
        .appendField(new Blockly.FieldDropdown(C_TYPES), 'TYPE')
        .appendField(nameField('globalVar'), 'NAME')
        .appendField('=');
      this.setColour(60);
      this.setTooltip('Declara una variable global. Arrastra este bloque fuera del Setup/Loop. «volatile» es necesario para variables usadas en interrupciones');
    },
  };

  // ── Constante ──────────────────────────────────
  Blockly.Blocks['arduino_const_define'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('const')
        .appendField(new Blockly.FieldDropdown([
          ['int', 'int'],
          ['float', 'float'],
          ['byte', 'byte'],
          ['long', 'long'],
          ['char', 'char'],
          ['unsigned int', 'unsigned int'],
          ['String', 'String'],
        ]), 'TYPE')
        .appendField(nameField('MI_CONST'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Define una constante. Flotante = global; dentro de función = local');
    },
  };

  // ── Array declaración ──────────────────────────
  Blockly.Blocks['arduino_array_declare'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(ARRAY_TYPES), 'TYPE')
        .appendField(nameField('miArray'), 'NAME')
        .appendField('[')
        .appendField(new Blockly.FieldNumber(10, 1, 10000), 'SIZE')
        .appendField(']');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip('Declara un array. Flotante = global; dentro de función = local');
    },
  };

  // ── Array con valores iniciales ────────────────
  Blockly.Blocks['arduino_array_declare_init'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(ARRAY_TYPES), 'TYPE')
        .appendField(nameField('miArray'), 'NAME')
        .appendField('[] = {')
        .appendField(new Blockly.FieldTextInput('1, 2, 3'), 'ITEMS')
        .appendField('}');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(60);
      this.setTooltip('Declara un array con sus valores iniciales. Flotante = global; dentro de función = local');
    },
  };

  // ── Array leer elemento ────────────────────────
  Blockly.Blocks['arduino_array_get'] = {
    init() {
      this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField(refField('miArray'), 'NAME')
        .appendField('[');
      this.appendDummyInput()
        .appendField(']');
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(330);
      this.setTooltip('Lee el elemento en la posición indicada del array');
    },
  };

  // ── Array escribir elemento ────────────────────
  Blockly.Blocks['arduino_array_set'] = {
    init() {
      this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField(refField('miArray'), 'NAME')
        .appendField('[');
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('] =');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Asigna un valor a la posición indicada del array');
    },
  };

  // ── #define ────────────────────────────────────
  Blockly.Blocks['arduino_define'] = {
    init() {
      this.appendDummyInput()
        .appendField('#define')
        .appendField(nameField('MI_DEFINE'), 'NAME')
        .appendField(new Blockly.FieldTextInput('13'), 'VALUE');
      this.setColour(200);
      this.setTooltip('Define una macro de preprocesador. Arrastra fuera del Setup/Loop para que quede al inicio del sketch');
    },
  };

  // ── struct ─────────────────────────────────────
  Blockly.Blocks['arduino_struct_define'] = {
    init() {
      this.appendDummyInput()
        .appendField('struct')
        .appendField(nameField('MiStruct'), 'NAME')
        .appendField('{')
        .appendField(new Blockly.FieldTextInput('int x; int y;'), 'FIELDS')
        .appendField('};');
      this.setColour(200);
      this.setTooltip('Define una estructura C. Arrastra fuera del Setup/Loop');
    },
  };

  // ── enum ───────────────────────────────────────
  Blockly.Blocks['arduino_enum_define'] = {
    init() {
      this.appendDummyInput()
        .appendField('enum')
        .appendField(nameField('MiEnum'), 'NAME')
        .appendField('{')
        .appendField(new Blockly.FieldTextInput('ROJO, VERDE, AZUL'), 'VALUES')
        .appendField('};');
      this.setColour(200);
      this.setTooltip('Define una enumeración C. Arrastra fuera del Setup/Loop');
    },
  };

  // ── break ──────────────────────────────────────
  Blockly.Blocks['arduino_break'] = {
    init() {
      this.appendDummyInput().appendField('break');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Sale del bucle o switch actual');
    },
  };

  // ── continue ───────────────────────────────────
  Blockly.Blocks['arduino_continue'] = {
    init() {
      this.appendDummyInput().appendField('continue');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Salta a la siguiente iteración del bucle');
    },
  };

  // ── micros ─────────────────────────────────────
  Blockly.Blocks['arduino_micros'] = {
    init() {
      this.appendDummyInput().appendField('micros()');
      this.setOutput(true, 'Number');
      this.setColour(120);
      this.setTooltip('Retorna el tiempo en microsegundos desde el inicio');
    },
  };
}
