import * as Blockly from 'blockly';

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
      this.appendDummyInput()
        .appendField('pinMode')
        .appendField(new Blockly.FieldNumber(13, 0, 53), 'PIN')
        .appendField(new Blockly.FieldDropdown([
          ['OUTPUT', 'OUTPUT'],
          ['INPUT', 'INPUT'],
          ['INPUT_PULLUP', 'INPUT_PULLUP'],
        ]), 'MODE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Configura un pin como entrada o salida');
    },
  };

  // ── digitalWrite ─────────────────────────────
  Blockly.Blocks['arduino_digital_write'] = {
    init() {
      this.appendDummyInput()
        .appendField('digitalWrite pin')
        .appendField(new Blockly.FieldNumber(13, 0, 53), 'PIN')
        .appendField(new Blockly.FieldDropdown([
          ['HIGH', 'HIGH'],
          ['LOW', 'LOW'],
        ]), 'VALUE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Escribe HIGH o LOW en un pin digital');
    },
  };

  // ── digitalRead ──────────────────────────────
  Blockly.Blocks['arduino_digital_read'] = {
    init() {
      this.appendDummyInput()
        .appendField('digitalRead pin')
        .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee el estado de un pin digital (HIGH/LOW)');
    },
  };

  // ── analogWrite (PWM) ────────────────────────
  Blockly.Blocks['arduino_analog_write'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('analogWrite pin')
        .appendField(new Blockly.FieldNumber(9, 0, 13), 'PIN')
        .appendField('valor');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Escribe un valor PWM (0-255) en un pin');
    },
  };

  // ── analogRead ───────────────────────────────
  Blockly.Blocks['arduino_analog_read'] = {
    init() {
      this.appendDummyInput()
        .appendField('analogRead pin A')
        .appendField(new Blockly.FieldNumber(0, 0, 5), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee un valor analógico (0-1023) de un pin');
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

  // ── Variable ─────────────────────────────────
  Blockly.Blocks['arduino_variable_declare'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldDropdown([
          ['int', 'int'],
          ['float', 'float'],
          ['bool', 'bool'],
          ['String', 'String'],
          ['long', 'long'],
          ['byte', 'byte'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('miVariable'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Declara e inicializa una variable');
    },
  };

  // ── Variable get ─────────────────────────────
  Blockly.Blocks['arduino_variable_get'] = {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('miVariable'), 'NAME');
      this.setOutput(true, null);
      this.setColour(330);
      this.setTooltip('Obtiene el valor de una variable');
    },
  };

  // ── Variable set ─────────────────────────────
  Blockly.Blocks['arduino_variable_set'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField(new Blockly.FieldTextInput('miVariable'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Asigna un valor a una variable existente');
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

  // ── for loop ─────────────────────────────────
  Blockly.Blocks['arduino_for'] = {
    init() {
      this.appendDummyInput()
        .appendField('for')
        .appendField(new Blockly.FieldTextInput('i'), 'VAR')
        .appendField('de')
        .appendField(new Blockly.FieldNumber(0), 'FROM')
        .appendField('hasta')
        .appendField(new Blockly.FieldNumber(10), 'TO')
        .appendField('paso')
        .appendField(new Blockly.FieldNumber(1), 'STEP');
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Bucle for con contador');
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
      this.appendValueInput('FREQ')
        .setCheck('Number')
        .appendField('tone pin')
        .appendField(new Blockly.FieldNumber(8, 0, 13), 'PIN')
        .appendField('frecuencia');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Genera un tono en un pin');
    },
  };

  // ── noTone ───────────────────────────────────
  Blockly.Blocks['arduino_no_tone'] = {
    init() {
      this.appendDummyInput()
        .appendField('noTone pin')
        .appendField(new Blockly.FieldNumber(8, 0, 13), 'PIN');
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
        ]), 'RETURN_TYPE')
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NAME')
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
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NAME')
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
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NAME')
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
          ['int', 'int'],
          ['float', 'float'],
          ['bool', 'bool'],
          ['String', 'String'],
          ['long', 'long'],
          ['byte', 'byte'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('globalVar'), 'NAME')
        .appendField('=');
      this.setColour(60);
      this.setTooltip('Declara una variable global. Arrastra este bloque fuera del Setup/Loop');
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
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('MI_CONST'), 'NAME')
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
        .appendField(new Blockly.FieldDropdown([
          ['int', 'int'],
          ['float', 'float'],
          ['byte', 'byte'],
          ['bool', 'bool'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('miArray'), 'NAME')
        .appendField('[')
        .appendField(new Blockly.FieldNumber(10, 1, 10000), 'SIZE')
        .appendField(']');
      this.setColour(60);
      this.setTooltip('Declara un array. Flotante = global; dentro de función = local');
    },
  };

  // ── Array leer elemento ────────────────────────
  Blockly.Blocks['arduino_array_get'] = {
    init() {
      this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField(new Blockly.FieldTextInput('miArray'), 'NAME')
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
        .appendField(new Blockly.FieldTextInput('miArray'), 'NAME')
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
        .appendField(new Blockly.FieldTextInput('MI_DEFINE'), 'NAME')
        .appendField(new Blockly.FieldTextInput('13'), 'VALUE');
      this.setColour(200);
      this.setTooltip('Define una macro de preprocesador. Arrastra fuera del Setup/Loop para que quede al inicio del sketch');
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
