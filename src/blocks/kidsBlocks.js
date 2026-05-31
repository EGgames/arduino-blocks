import * as Blockly from 'blockly';

function pinFieldValidator(value) {
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

// ──────────────────────────────────────────────────────────────────────────────
// Tema visual para el modo Niño: bloques más grandes, colores amigables
// ──────────────────────────────────────────────────────────────────────────────

let _kidsTheme = null;
export function getKidsTheme() {
  if (_kidsTheme) return _kidsTheme;
  try {
    _kidsTheme = Blockly.Theme.defineTheme('arduinoKids', {
      base: Blockly.Themes.Zelos,
      componentStyles: {
        workspaceBackgroundColour: '#f0f7ff',
        toolboxBackgroundColour: '#1a237e',
        toolboxForegroundColour: '#ffffff',
        flyoutBackgroundColour: '#283593',
        flyoutForegroundColour: '#ffffff',
        scrollbarColour: '#90caf9',
        scrollbarOpacity: 0.8,
      },
      // fontStyle deliberadamente sin cambiar — Blockly mide el texto con el font
      // por defecto y luego calcula el ancho del bloque. Si se cambia el font
      // size/weight el texto renderizado es más ancho que el espacio calculado
      // y desborda. El zoom (startScale) escala todo proporcionalmente sin ese problema.
    });
  } catch {
    _kidsTheme = Blockly.Themes.Zelos;
  }
  return _kidsTheme;
}

// ──────────────────────────────────────────────────────────────────────────────
// Tema oscuro para el modo Avanzado (HU-23)
// ──────────────────────────────────────────────────────────────────────────────

let _darkTheme = null;
export function getArduinoDarkTheme() {
  if (_darkTheme) return _darkTheme;
  try {
    _darkTheme = Blockly.Theme.defineTheme('arduinoDark', {
      base: Blockly.Themes.Zelos,
      componentStyles: {
        workspaceBackgroundColour: '#1a2335',
        toolboxBackgroundColour: '#1e2a3e',
        toolboxForegroundColour: '#e0ecff',
        flyoutBackgroundColour: '#192236',
        flyoutForegroundColour: '#d4e6ff',
        flyoutOpacity: 1,
        scrollbarColour: '#4fc3f7',
        scrollbarOpacity: 0.4,
      },
    });
  } catch {
    _darkTheme = Blockly.Themes.Zelos;
  }
  return _darkTheme;
}

// ──────────────────────────────────────────────────────────────────────────────
// Bloques "Kids" — versión completamente en español para el modo Niño
// Misma estructura interna (mismos nombres de campo/input) que los bloques
// arduino_* para que los generadores puedan delegarse directamente.
// ──────────────────────────────────────────────────────────────────────────────

export function defineKidsBlocks() {

  // ── Preparar / Repetir (equivalente a arduino_setup_loop) ─────────────────
  Blockly.Blocks['kids_setup_loop'] = {
    init() {
      this.appendStatementInput('SETUP')
        .setCheck(null)
        .appendField('⚙️ Preparar (una vez)');
      this.appendStatementInput('LOOP')
        .setCheck(null)
        .appendField('🔁 Repetir siempre');
      this.setColour(210);
      this.setTooltip('El código en "Preparar" se ejecuta una sola vez al encender. El de "Repetir" se repite para siempre.');
      this.setDeletable(false);
      this.setMovable(false);
    },
  };

  // ── Configurar pin ────────────────────────────────────────────────────────
  Blockly.Blocks['kids_pin_mode'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔌 Configurar pin')
        .appendField(new Blockly.FieldTextInput('13', pinFieldValidator), 'PIN');
      this.appendDummyInput()
        .appendField('como')
        .appendField(new Blockly.FieldDropdown([
          ['📤 SALIDA', 'OUTPUT'],
          ['📥 ENTRADA', 'INPUT'],
          ['⬆️ PULLUP', 'INPUT_PULLUP'],
        ]), 'MODE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Configura si el pin enviará o recibirá señales eléctricas.');
    },
  };

  // ── Encender / Apagar pin ─────────────────────────────────────────────────
  Blockly.Blocks['kids_digital_write'] = {
    init() {
      this.appendDummyInput()
        .appendField('💡 Pin')
        .appendField(new Blockly.FieldTextInput('13', pinFieldValidator), 'PIN')
        .appendField(new Blockly.FieldDropdown([
          ['🟢 ENCENDIDO', 'HIGH'],
          ['⚫ APAGADO', 'LOW'],
        ]), 'VALUE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Enciende o apaga un pin digital (por ejemplo, un LED).');
    },
  };

  // ── Leer pin digital ──────────────────────────────────────────────────────
  Blockly.Blocks['kids_digital_read'] = {
    init() {
      this.appendDummyInput()
        .appendField('👁️ Leer pin')
        .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee si un pin está ENCENDIDO (1) o APAGADO (0), por ejemplo un botón.');
    },
  };

  // ── Brillo / PWM ──────────────────────────────────────────────────────────
  Blockly.Blocks['kids_analog_write'] = {
    init() {
      this.appendDummyInput()
        .appendField('〰️ Brillo pin')
        .appendField(new Blockly.FieldTextInput('9', pinFieldValidator), 'PIN');
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('intensidad (0-255)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Controla el brillo de un LED o la velocidad de un motor (0 = apagado, 255 = máximo).');
    },
  };

  // ── Leer sensor analógico ─────────────────────────────────────────────────
  Blockly.Blocks['kids_analog_read'] = {
    init() {
      this.appendDummyInput()
        .appendField('📊 Leer sensor A')
        .appendField(new Blockly.FieldNumber(0, 0, 5), 'PIN');
      this.setOutput(true, 'Number');
      this.setColour(160);
      this.setTooltip('Lee un sensor conectado a un pin analógico. Devuelve un número de 0 a 1023.');
    },
  };

  // ── Esperar ───────────────────────────────────────────────────────────────
  Blockly.Blocks['kids_delay'] = {
    init() {
      this.appendValueInput('MS')
        .setCheck('Number')
        .appendField('⏸️ Esperar');
      this.appendDummyInput()
        .appendField('milisegundos');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Pausa el programa. 1000 milisegundos = 1 segundo.');
    },
  };

  // ── Tiempo transcurrido ───────────────────────────────────────────────────
  Blockly.Blocks['kids_millis'] = {
    init() {
      this.appendDummyInput()
        .appendField('⏱️ Tiempo desde el inicio (ms)');
      this.setOutput(true, 'Number');
      this.setColour(120);
      this.setTooltip('Devuelve cuántos milisegundos han pasado desde que encendiste la placa.');
    },
  };

  // ── Iniciar comunicación serial ────────────────────────────────────────────
  Blockly.Blocks['kids_serial_begin'] = {
    init() {
      this.appendDummyInput()
        .appendField('📡 Iniciar comunicación');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Activa la comunicación entre la placa y la computadora para ver mensajes.');
    },
  };

  // ── Mostrar mensaje (con salto) ────────────────────────────────────────────
  Blockly.Blocks['kids_serial_println'] = {
    init() {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('🖨️ Mostrar mensaje');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Muestra un mensaje en la pantalla de la computadora (con salto de línea al final).');
    },
  };

  // ── Mostrar sin salto ──────────────────────────────────────────────────────
  Blockly.Blocks['kids_serial_print'] = {
    init() {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('📝 Mostrar texto');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(65);
      this.setTooltip('Muestra un texto sin saltar a la siguiente línea.');
    },
  };

  // ── Si ... hacer ──────────────────────────────────────────────────────────
  Blockly.Blocks['kids_if_simple'] = {
    init() {
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('❓ Si');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('entonces hacer');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Ejecuta acciones solo si se cumple una condición.');
    },
  };

  // ── Si ... si no ─────────────────────────────────────────────────────────
  Blockly.Blocks['kids_if'] = {
    init() {
      this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField('❓ Si');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('entonces hacer');
      this.appendStatementInput('ELSE')
        .setCheck(null)
        .appendField('si no, hacer');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Ejecuta un bloque si se cumple la condición, y otro bloque si no se cumple.');
    },
  };

  // ── Repetir N veces ───────────────────────────────────────────────────────
  Blockly.Blocks['kids_for'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔁 Repetir con')
        .appendField(new Blockly.FieldTextInput('i'), 'VAR');
      this.appendDummyInput()
        .appendField('de')
        .appendField(new Blockly.FieldNumber(0), 'FROM')
        .appendField('hasta')
        .appendField(new Blockly.FieldNumber(10), 'TO')
        .appendField('paso')
        .appendField(new Blockly.FieldNumber(1), 'STEP');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('hacer');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Repite las acciones contando desde el número inicial hasta el final.');
    },
  };

  // ── Comparar ─────────────────────────────────────────────────────────────
  Blockly.Blocks['kids_compare'] = {
    init() {
      this.appendValueInput('A').setCheck('Number');
      this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['= igual', '=='],
          ['≠ distinto', '!='],
          ['< menor', '<'],
          ['≤ menor igual', '<='],
          ['> mayor', '>'],
          ['≥ mayor igual', '>='],
        ]), 'OP');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(210);
      this.setTooltip('Compara dos números y devuelve verdadero o falso.');
    },
  };

  // ── Hacer sonido ──────────────────────────────────────────────────────────
  Blockly.Blocks['kids_tone'] = {
    init() {
      this.appendDummyInput()
        .appendField('🎵 Sonar en pin')
        .appendField(new Blockly.FieldNumber(8, 0, 13), 'PIN');
      this.appendValueInput('FREQ')
        .setCheck('Number')
        .appendField('frecuencia (Hz)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Hace sonar un zumbador o altavoz en la frecuencia indicada (440 Hz = nota La).');
    },
  };

  // ── Silencio ──────────────────────────────────────────────────────────────
  Blockly.Blocks['kids_no_tone'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔇 Silencio en pin')
        .appendField(new Blockly.FieldNumber(8, 0, 13), 'PIN');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('Para el sonido en el pin indicado.');
    },
  };

  // ── BLOQUES COMPLETOS (versión kids de todos los bloques avanzados) ────────

  Blockly.Blocks['kids_comment'] = {
    init() {
      this.appendDummyInput()
        .appendField('💬 Nota:')
        .appendField(new Blockly.FieldTextInput('escribe tu comentario aquí'), 'TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
      this.setTooltip('Agrega una nota al código. No cambia el funcionamiento del programa.');
    },
  };

  // Flotante (sin prev/next) — workspaceToCode lo recoge
  Blockly.Blocks['kids_define'] = {
    init() {
      this.appendDummyInput()
        .appendField('🏷️ Nombrar')
        .appendField(new Blockly.FieldTextInput('LED_PIN'), 'NAME')
        .appendField('como')
        .appendField(new Blockly.FieldTextInput('13'), 'VALUE');
      this.setColour(200);
      this.setTooltip('Le pone un nombre corto a un número. Arrastra fuera de Preparar/Repetir.');
    },
  };

  // Flotante — workspaceToCode lo recoge
  Blockly.Blocks['kids_include'] = {
    init() {
      this.appendDummyInput()
        .appendField('📚 Librería:')
        .appendField(new Blockly.FieldTextInput('Wire'), 'LIB');
      this.setColour(200);
      this.setTooltip('Agrega una librería especial. Arrastra fuera de Preparar/Repetir.');
    },
  };

  Blockly.Blocks['kids_map'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Number').appendField('📐 Transformar');
      this.appendValueInput('FROM_LOW').setCheck('Number').appendField('de');
      this.appendValueInput('FROM_HIGH').setCheck('Number').appendField('a');
      this.appendValueInput('TO_LOW').setCheck('Number').appendField('→ nuevo rango de');
      this.appendValueInput('TO_HIGH').setCheck('Number').appendField('a');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Convierte un valor de un rango a otro. Ej: sensor 0-1023 → brillo 0-255.');
    },
  };

  Blockly.Blocks['kids_constrain'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Number').appendField('📏 Limitar');
      this.appendValueInput('MIN').setCheck('Number').appendField('entre');
      this.appendValueInput('MAX').setCheck('Number').appendField('y');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setColour(230);
      this.setTooltip('Limita un valor para que nunca salga del rango mínimo-máximo.');
    },
  };

  Blockly.Blocks['kids_delay_micros'] = {
    init() {
      this.appendValueInput('US').setCheck('Number').appendField('⏱️ Esperar (muy poco)');
      this.appendDummyInput().appendField('microsegundos');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Espera en millonésimas de segundo. 1000 µs = 1 milisegundo.');
    },
  };

  Blockly.Blocks['kids_micros'] = {
    init() {
      this.appendDummyInput().appendField('🕐 Tiempo exacto (µs)');
      this.setOutput(true, 'Number');
      this.setColour(120);
      this.setTooltip('Tiempo en microsegundos desde que encendiste la placa. Muy preciso.');
    },
  };

  Blockly.Blocks['kids_serial_available'] = {
    init() {
      this.appendDummyInput().appendField('📬 ¿Hay mensajes?');
      this.setOutput(true, 'Number');
      this.setColour(65);
      this.setTooltip('Dice cuántos bytes llegaron desde la computadora. 0 = no hay nada.');
    },
  };

  Blockly.Blocks['kids_serial_read'] = {
    init() {
      this.appendDummyInput().appendField('📨 Leer carácter');
      this.setOutput(true, 'Number');
      this.setColour(65);
      this.setTooltip('Lee el siguiente carácter que llegó de la computadora.');
    },
  };

  Blockly.Blocks['kids_while'] = {
    init() {
      this.appendValueInput('CONDITION').setCheck('Boolean').appendField('🔄 Repetir mientras');
      this.appendStatementInput('DO').setCheck(null).appendField('hacer');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Repite las acciones mientras la condición sea verdadera.');
    },
  };

  Blockly.Blocks['kids_do_while'] = {
    init() {
      this.appendStatementInput('DO').setCheck(null).appendField('🔃 Hacer primero');
      this.appendValueInput('CONDITION').setCheck('Boolean').appendField('y repetir si');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Hace las acciones al menos una vez y las repite si la condición sigue siendo verdadera.');
    },
  };

  Blockly.Blocks['kids_switch'] = {
    init() {
      this.appendValueInput('EXPR').setCheck(null).appendField('🔀 Según el valor de');
      this.appendValueInput('CASE1_VAL').setCheck(null).appendField('cuando sea');
      this.appendStatementInput('DO1').setCheck(null).appendField('hacer');
      this.appendValueInput('CASE2_VAL').setCheck(null).appendField('cuando sea');
      this.appendStatementInput('DO2').setCheck(null).appendField('hacer');
      this.appendStatementInput('DEFAULT').setCheck(null).appendField('en cualquier otro caso');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Elige qué hacer según el valor exacto de una variable o expresión.');
    },
  };

  Blockly.Blocks['kids_break'] = {
    init() {
      this.appendDummyInput().appendField('🛑 Salir del bucle');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Para el bucle inmediatamente y sigue con lo que viene después.');
    },
  };

  Blockly.Blocks['kids_continue'] = {
    init() {
      this.appendDummyInput().appendField('⏭️ Saltar esta vuelta');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Salta el resto de esta vuelta del bucle y pasa a la siguiente.');
    },
  };

  Blockly.Blocks['kids_variable_declare'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('📦 Variable')
        .appendField(new Blockly.FieldDropdown([
          ['número', 'int'],
          ['decimal', 'float'],
          ['sí/no', 'bool'],
          ['texto', 'String'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('miVariable'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Crea una variable para guardar un dato.');
    },
  };

  Blockly.Blocks['kids_variable_get'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔍 Variable')
        .appendField(new Blockly.FieldTextInput('miVariable'), 'NAME');
      this.setOutput(true, null);
      this.setColour(330);
      this.setTooltip('Usa el valor guardado en una variable.');
    },
  };

  Blockly.Blocks['kids_variable_set'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('✏️ Cambiar variable')
        .appendField(new Blockly.FieldTextInput('miVariable'), 'NAME')
        .appendField('a');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Cambia el valor guardado en una variable existente.');
    },
  };

  // Flotante — workspaceToCode lo recoge
  Blockly.Blocks['kids_global_var'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('🌐 Variable global')
        .appendField(new Blockly.FieldDropdown([
          ['número', 'int'],
          ['decimal', 'float'],
          ['sí/no', 'bool'],
          ['texto', 'String'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('globalVar'), 'NAME')
        .appendField('=');
      this.setColour(60);
      this.setTooltip('Variable que se puede usar en todo el programa. Arrastra fuera de Preparar/Repetir.');
    },
  };

  Blockly.Blocks['kids_const'] = {
    init() {
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('🔒 Valor fijo')
        .appendField(new Blockly.FieldDropdown([
          ['número', 'int'],
          ['decimal', 'float'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('MI_VALOR'), 'NAME')
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Un número que no cambia nunca. Ideal para el número de un pin.');
    },
  };

  // Flotante — workspaceToCode lo recoge
  Blockly.Blocks['kids_array_declare'] = {
    init() {
      this.appendDummyInput()
        .appendField('📋 Lista')
        .appendField(new Blockly.FieldDropdown([
          ['números', 'int'],
          ['decimales', 'float'],
        ]), 'TYPE')
        .appendField(new Blockly.FieldTextInput('miLista'), 'NAME')
        .appendField('de')
        .appendField(new Blockly.FieldNumber(10, 1, 10000), 'SIZE')
        .appendField('elementos');
      this.setColour(60);
      this.setTooltip('Crea una lista para guardar varios números. Arrastra fuera de Preparar/Repetir.');
    },
  };

  Blockly.Blocks['kids_array_get'] = {
    init() {
      this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField('📖 Leer lista')
        .appendField(new Blockly.FieldTextInput('miLista'), 'NAME')
        .appendField('posición');
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(330);
      this.setTooltip('Lee el valor en una posición de la lista. La primera posición es 0.');
    },
  };

  Blockly.Blocks['kids_array_set'] = {
    init() {
      this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField('📝 Guardar en lista')
        .appendField(new Blockly.FieldTextInput('miLista'), 'NAME')
        .appendField('posición');
      this.appendValueInput('VALUE').setCheck(null).appendField('el valor');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip('Guarda un valor en una posición de la lista.');
    },
  };

  Blockly.Blocks['kids_logic'] = {
    init() {
      this.appendValueInput('A').setCheck('Boolean');
      this.appendValueInput('B')
        .setCheck('Boolean')
        .appendField(new Blockly.FieldDropdown([
          ['Y (las dos)', '&&'],
          ['O (al menos una)', '||'],
        ]), 'OP');
      this.setInputsInline(true);
      this.setOutput(true, 'Boolean');
      this.setColour(210);
      this.setTooltip('"Y" es verdadero solo si las DOS condiciones son verdaderas. "O" es verdadero si al menos UNA lo es.');
    },
  };

  Blockly.Blocks['kids_not'] = {
    init() {
      this.appendValueInput('VALUE').setCheck('Boolean').appendField('❌ Lo contrario de');
      this.setOutput(true, 'Boolean');
      this.setColour(210);
      this.setTooltip('Invierte una condición: verdadero → falso, falso → verdadero.');
    },
  };

  // Flotante — workspaceToCode lo recoge
  Blockly.Blocks['kids_function_define'] = {
    init() {
      this.appendDummyInput()
        .appendField('🧩 Crear bloque')
        .appendField(new Blockly.FieldDropdown([
          ['sin resultado', 'void'],
          ['con número', 'int'],
          ['con decimal', 'float'],
          ['sí/no', 'bool'],
          ['con texto', 'String'],
        ]), 'RETURN_TYPE')
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'PARAMS')
        .appendField(')');
      this.appendStatementInput('BODY').setCheck(null).appendField('hace');
      this.setColour(270);
      this.setTooltip('Crea un bloque propio con acciones. Puede recibir parámetros entre paréntesis.');
    },
  };

  Blockly.Blocks['kids_function_call'] = {
    init() {
      this.appendDummyInput()
        .appendField('▶️ Usar bloque')
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(270);
      this.setTooltip('Ejecuta un bloque propio que creaste con "Crear bloque".');
    },
  };

  Blockly.Blocks['kids_function_call_expr'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔢 Resultado de')
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NAME')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'ARGS')
        .appendField(')');
      this.setOutput(true, null);
      this.setColour(270);
      this.setTooltip('Ejecuta un bloque propio y usa el valor que devuelve.');
    },
  };

  Blockly.Blocks['kids_return'] = {
    init() {
      this.appendValueInput('VALUE').setCheck(null).appendField('↩️ Devolver');
      this.setPreviousStatement(true, null);
      this.setColour(270);
      this.setTooltip('Devuelve un valor desde el bloque propio.');
    },
  };

  Blockly.Blocks['kids_return_void'] = {
    init() {
      this.appendDummyInput().appendField('↩️ Terminar bloque');
      this.setPreviousStatement(true, null);
      this.setColour(270);
      this.setTooltip('Termina el bloque propio en este punto sin devolver nada.');
    },
  };

  // ── RGB y NeoPixel ────────────────────────────────────────────────────────

  // LED de color RGB (pines separados R, G, B)
  Blockly.Blocks['kids_rgb_led'] = {
    init() {
      this.appendDummyInput()
        .appendField('🌈 LED de colores');
      this.appendDummyInput()
        .appendField('Rojo (pin)')
        .appendField(new Blockly.FieldNumber(9, 0, 53), 'PIN_R')
        .appendField('intensidad')
        .appendField(new Blockly.FieldNumber(255, 0, 255), 'VAL_R');
      this.appendDummyInput()
        .appendField('Verde (pin)')
        .appendField(new Blockly.FieldNumber(10, 0, 53), 'PIN_G')
        .appendField('intensidad')
        .appendField(new Blockly.FieldNumber(0, 0, 255), 'VAL_G');
      this.appendDummyInput()
        .appendField('Azul (pin)')
        .appendField(new Blockly.FieldNumber(11, 0, 53), 'PIN_B')
        .appendField('intensidad')
        .appendField(new Blockly.FieldNumber(0, 0, 255), 'VAL_B');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Enciende un LED RGB con la mezcla de colores que elijas (0=apagado, 255=máximo). Conecta cada pin a R, G y B del LED.');
    },
  };

  // Preparar tira NeoPixel (Adafruit NeoPixel)
  Blockly.Blocks['kids_neopixel_setup'] = {
    init() {
      this.appendDummyInput()
        .appendField('✨ Preparar tira de luces')
        .appendField(new Blockly.FieldNumber(6, 0, 53), 'PIN')
        .appendField('pin,')
        .appendField(new Blockly.FieldNumber(8, 1, 300), 'NUM')
        .appendField('LEDs');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Configura una tira de LEDs de colores NeoPixel. Pon este bloque en ⚙️ Preparar.');
    },
  };

  // Poner color a un pixel NeoPixel
  Blockly.Blocks['kids_neopixel_color'] = {
    init() {
      this.appendDummyInput()
        .appendField('🎨 Luz número')
        .appendField(new Blockly.FieldNumber(0, 0, 299), 'PIXEL')
        .appendField('→ Rojo')
        .appendField(new Blockly.FieldNumber(255, 0, 255), 'R')
        .appendField('Verde')
        .appendField(new Blockly.FieldNumber(0, 0, 255), 'G')
        .appendField('Azul')
        .appendField(new Blockly.FieldNumber(0, 0, 255), 'B');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Elige el color de una luz de la tira. 0 es la primera. Mezcla Rojo, Verde y Azul para hacer cualquier color.');
    },
  };

  // Mostrar cambios NeoPixel
  Blockly.Blocks['kids_neopixel_show'] = {
    init() {
      this.appendDummyInput().appendField('💡 Mostrar luces');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Aplica los colores que elegiste. Sin este bloque los LEDs no cambian.');
    },
  };

  // Apagar todos los NeoPixels
  Blockly.Blocks['kids_neopixel_clear'] = {
    init() {
      this.appendDummyInput().appendField('🌑 Apagar todas las luces');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Apaga todos los LEDs de la tira de colores.');
    },
  };

  // Brillo general de la tira
  Blockly.Blocks['kids_neopixel_brightness'] = {
    init() {
      this.appendDummyInput()
        .appendField('🔆 Brillo de la tira')
        .appendField(new Blockly.FieldNumber(50, 0, 255), 'BRIGHTNESS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Ajusta el brillo de toda la tira (0=apagado, 255=máximo). Úsalo en ⚙️ Preparar después de preparar la tira.');
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Registrar generadores para los bloques kids_*
// Los campos internos tienen los mismos nombres que los bloques arduino_*,
// por lo que simplemente delegamos al generador correspondiente.
// ──────────────────────────────────────────────────────────────────────────────

export function registerKidsGenerators(gen) {
  const fb = gen.forBlock;

  // kids_setup_loop: igual que arduino_setup_loop, no genera código directamente
  // (workspaceToCode lo maneja por separado)
  fb['kids_setup_loop'] = function () { return ''; };

  // Pines
  fb['kids_pin_mode']      = (b) => fb['arduino_pin_mode'](b);
  fb['kids_digital_write'] = (b) => fb['arduino_digital_write'](b);
  fb['kids_digital_read']  = (b) => fb['arduino_digital_read'](b);
  fb['kids_analog_write']  = (b) => fb['arduino_analog_write'](b);
  fb['kids_analog_read']   = (b) => fb['arduino_analog_read'](b);

  // Tiempo
  fb['kids_delay']         = (b) => fb['arduino_delay'](b);
  fb['kids_millis']        = (b) => fb['arduino_millis'](b);

  // Serial — kids_serial_begin usa baud 9600 fijo (sin dropdown)
  fb['kids_serial_begin']   = () => 'Serial.begin(9600);\n';
  fb['kids_serial_println'] = (b) => fb['arduino_serial_println'](b);
  fb['kids_serial_print']   = (b) => fb['arduino_serial_print'](b);

  // Control
  fb['kids_if_simple'] = (b) => fb['arduino_if_simple'](b);
  fb['kids_if']        = (b) => fb['arduino_if'](b);
  fb['kids_for']       = (b) => fb['arduino_for'](b);

  // Comparación
  fb['kids_compare'] = (b) => fb['arduino_compare'](b);

  // Sonido
  fb['kids_tone']    = (b) => fb['arduino_tone'](b);
  fb['kids_no_tone'] = (b) => fb['arduino_no_tone'](b);

  // Estructura extra
  fb['kids_comment'] = (b) => fb['arduino_comment'](b);
  fb['kids_define']  = (b) => fb['arduino_define'](b);
  fb['kids_include'] = (b) => fb['arduino_include'](b);

  // Analógico avanzado
  fb['kids_map']       = (b) => fb['arduino_map'](b);
  fb['kids_constrain'] = (b) => fb['arduino_constrain'](b);

  // Tiempo extra
  fb['kids_delay_micros'] = (b) => fb['arduino_delay_microseconds'](b);
  fb['kids_micros']       = (b) => fb['arduino_micros'](b);

  // Serial extra
  fb['kids_serial_available'] = (b) => fb['arduino_serial_available'](b);
  fb['kids_serial_read']      = (b) => fb['arduino_serial_read'](b);

  // Control extra
  fb['kids_while']    = (b) => fb['arduino_while'](b);
  fb['kids_do_while'] = (b) => fb['arduino_do_while'](b);
  fb['kids_switch']   = (b) => fb['arduino_switch_case'](b);
  fb['kids_break']    = (b) => fb['arduino_break'](b);
  fb['kids_continue'] = (b) => fb['arduino_continue'](b);

  // Variables
  fb['kids_variable_declare'] = (b) => fb['arduino_variable_declare'](b);
  fb['kids_variable_get']     = (b) => fb['arduino_variable_get'](b);
  fb['kids_variable_set']     = (b) => fb['arduino_variable_set'](b);
  fb['kids_global_var']       = (b) => fb['arduino_global_variable_declare'](b);
  fb['kids_const']            = (b) => fb['arduino_const_define'](b);
  fb['kids_array_declare']    = (b) => fb['arduino_array_declare'](b);
  fb['kids_array_get']        = (b) => fb['arduino_array_get'](b);
  fb['kids_array_set']        = (b) => fb['arduino_array_set'](b);

  // Lógica extra
  fb['kids_logic'] = (b) => fb['arduino_logic'](b);
  fb['kids_not']   = (b) => fb['arduino_not'](b);

  // Funciones propias
  fb['kids_function_define']    = () => '';
  fb['kids_function_call']      = (b) => fb['arduino_function_call'](b);
  fb['kids_function_call_expr'] = (b) => fb['arduino_function_call_expr'](b);
  fb['kids_return']             = (b) => fb['arduino_return'](b);
  fb['kids_return_void']        = (b) => fb['arduino_return_void'](b);

  // RGB LED (pines separados)
  fb['kids_rgb_led'] = (b) => {
    const pinR = b.getFieldValue('PIN_R') || '9';
    const pinG = b.getFieldValue('PIN_G') || '10';
    const pinB = b.getFieldValue('PIN_B') || '11';
    const valR = b.getFieldValue('VAL_R') ?? '255';
    const valG = b.getFieldValue('VAL_G') ?? '0';
    const valB = b.getFieldValue('VAL_B') ?? '0';
    return `analogWrite(${pinR}, ${valR});\nanalogWrite(${pinG}, ${valG});\nanalogWrite(${pinB}, ${valB});\n`;
  };

  // NeoPixel — la declaración global y el #include se generan en workspaceToCode
  // Este bloque solo emite strip.begin() para colocarlo en setup()
  fb['kids_neopixel_setup'] = () => 'strip.begin();\n';

  fb['kids_neopixel_color'] = (b) => {
    const pixel = b.getFieldValue('PIXEL') ?? '0';
    const r     = b.getFieldValue('R')     ?? '255';
    const g     = b.getFieldValue('G')     ?? '0';
    const blue  = b.getFieldValue('B')     ?? '0';
    return `strip.setPixelColor(${pixel}, strip.Color(${r}, ${g}, ${blue}));\n`;
  };

  fb['kids_neopixel_show']       = () => 'strip.show();\n';
  fb['kids_neopixel_clear']      = () => 'strip.clear();\nstrip.show();\n';
  fb['kids_neopixel_brightness'] = (b) => {
    const br = b.getFieldValue('BRIGHTNESS') ?? '50';
    return `strip.setBrightness(${br});\n`;
  };
}
