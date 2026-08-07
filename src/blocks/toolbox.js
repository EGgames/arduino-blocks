// ── Helpers de shadow blocks ──────────────────────────────────────────────────
// Un "shadow" es un bloque de relleno que se ve como un campo pero puede
// sustituirse arrastrando encima cualquier bloque de valor (p. ej. una variable).

const num = (n) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const txt = (t) => ({ shadow: { type: 'text', fields: { TEXT: t } } });
const state = (s = 'HIGH') => ({ shadow: { type: 'arduino_digital_state', fields: { STATE: s } } });
const apin = (p = 'A0') => ({ shadow: { type: 'arduino_analog_pin', fields: { PIN: p } } });

export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '⚙️ Estructura',
      colour: '210',
      contents: [
        { kind: 'block', type: 'arduino_setup_loop' },
        { kind: 'block', type: 'arduino_comment' },
        { kind: 'block', type: 'arduino_block_comment' },
        { kind: 'block', type: 'arduino_define', fields: { NAME: 'LED_BUILTIN', VALUE: '13' } },
        { kind: 'block', type: 'arduino_include', fields: { LIB: 'Wire' } },
        { kind: 'block', type: 'arduino_struct_define' },
        { kind: 'block', type: 'arduino_enum_define' },
        { kind: 'block', type: 'arduino_raw_statement' },
        { kind: 'block', type: 'arduino_raw_expression' },
      ],
    },
    {
      kind: 'category',
      name: '📌 Pines Digitales',
      colour: '160',
      contents: [
        {
          kind: 'block',
          type: 'arduino_pin_mode',
          fields: { MODE: 'OUTPUT' },
          inputs: { PIN: num(13) },
        },
        {
          kind: 'block',
          type: 'arduino_digital_write',
          inputs: { PIN: num(13), VALUE: state() },
        },
        { kind: 'block', type: 'arduino_digital_read', inputs: { PIN: num(2) } },
        { kind: 'block', type: 'arduino_digital_state', fields: { STATE: 'HIGH' } },
        { kind: 'block', type: 'arduino_pulse_in', inputs: { PIN: num(7) } },
        {
          kind: 'block',
          type: 'arduino_shift_out',
          inputs: { DATA: num(11), CLOCK: num(12), VALUE: num(0) },
        },
        { kind: 'block', type: 'arduino_shift_in', inputs: { DATA: num(11), CLOCK: num(12) } },
      ],
    },
    {
      kind: 'category',
      name: '📊 Pines Analógicos',
      colour: '160',
      contents: [
        {
          kind: 'block',
          type: 'arduino_analog_write',
          inputs: { PIN: num(9), VALUE: num(128) },
        },
        { kind: 'block', type: 'arduino_analog_read', inputs: { PIN: apin() } },
        { kind: 'block', type: 'arduino_analog_pin', fields: { PIN: 'A0' } },
        { kind: 'block', type: 'arduino_analog_reference', fields: { REF: 'DEFAULT' } },
        {
          kind: 'block',
          type: 'arduino_map',
          inputs: { FROM_LOW: num(0), FROM_HIGH: num(1023), TO_LOW: num(0), TO_HIGH: num(255) },
        },
        {
          kind: 'block',
          type: 'arduino_constrain',
          inputs: { MIN: num(0), MAX: num(255) },
        },
      ],
    },
    {
      kind: 'category',
      name: '⚡ Interrupciones',
      colour: '160',
      contents: [
        {
          kind: 'block',
          type: 'arduino_attach_interrupt',
          fields: { ISR: 'miISR', MODE: 'CHANGE' },
          inputs: { PIN: num(2) },
        },
        { kind: 'block', type: 'arduino_detach_interrupt', inputs: { PIN: num(2) } },
        { kind: 'block', type: 'arduino_interrupts_toggle', fields: { ACTION: 'noInterrupts' } },
      ],
    },
    {
      kind: 'category',
      name: '⏱️ Tiempo',
      colour: '120',
      contents: [
        { kind: 'block', type: 'arduino_delay', inputs: { MS: num(1000) } },
        { kind: 'block', type: 'arduino_delay_microseconds', inputs: { US: num(100) } },
        { kind: 'block', type: 'arduino_millis' },
        { kind: 'block', type: 'arduino_micros' },
      ],
    },
    {
      kind: 'category',
      name: '📡 Serial',
      colour: '65',
      contents: [
        { kind: 'block', type: 'arduino_serial_begin', fields: { BAUD: '9600' } },
        { kind: 'block', type: 'arduino_serial_println', inputs: { TEXT: txt('Hola Arduino') } },
        { kind: 'block', type: 'arduino_serial_print', inputs: { TEXT: txt('valor: ') } },
        { kind: 'block', type: 'arduino_serial_print_base', inputs: { TEXT: num(255) } },
        { kind: 'block', type: 'arduino_serial_println_empty' },
        { kind: 'block', type: 'arduino_serial_write', inputs: { DATA: num(65) } },
        { kind: 'block', type: 'arduino_serial_action', fields: { ACTION: 'flush' } },
        { kind: 'block', type: 'arduino_serial_read_value', fields: { FN: 'parseInt' } },
        { kind: 'block', type: 'arduino_serial_read_string_until' },
        { kind: 'block', type: 'arduino_serial_available' },
        { kind: 'block', type: 'arduino_serial_read' },
      ],
    },
    {
      kind: 'category',
      name: '🔁 Control',
      colour: '120',
      contents: [
        { kind: 'block', type: 'arduino_if_simple' },
        { kind: 'block', type: 'arduino_if' },
        { kind: 'block', type: 'arduino_if_else_if' },
        { kind: 'block', type: 'arduino_ternary' },
        {
          kind: 'block',
          type: 'arduino_for',
          fields: { VAR: 'i' },
          inputs: { FROM: num(0), TO: num(10), STEP: num(1) },
        },
        { kind: 'block', type: 'arduino_while' },
        { kind: 'block', type: 'arduino_do_while' },
        { kind: 'block', type: 'arduino_switch_case' },
        { kind: 'block', type: 'arduino_break' },
        { kind: 'block', type: 'arduino_continue' },
      ],
    },
    {
      kind: 'category',
      name: '📦 Variables',
      colour: '330',
      contents: [
        {
          kind: 'block',
          type: 'arduino_variable_declare',
          fields: { TYPE: 'int', NAME: 'miVar' },
          inputs: { VALUE: num(0) },
        },
        { kind: 'block', type: 'arduino_variable_get', fields: { NAME: 'miVar' } },
        {
          kind: 'block',
          type: 'arduino_variable_set',
          fields: { NAME: 'miVar' },
          inputs: { VALUE: num(0) },
        },
        {
          kind: 'block',
          type: 'arduino_compound_assign',
          fields: { NAME: 'miVar', OP: '+=' },
          inputs: { VALUE: num(1) },
        },
        { kind: 'block', type: 'arduino_increment', fields: { NAME: 'i', OP: '++' } },
        {
          kind: 'block',
          type: 'arduino_global_variable_declare',
          fields: { STORAGE: '', TYPE: 'int', NAME: 'globalVar' },
          inputs: { VALUE: num(0) },
        },
        {
          kind: 'block',
          type: 'arduino_const_define',
          fields: { TYPE: 'int', NAME: 'MI_CONST' },
          inputs: { VALUE: num(0) },
        },
        {
          kind: 'block',
          type: 'arduino_array_declare',
          fields: { TYPE: 'int', NAME: 'miArray', SIZE: 10 },
        },
        {
          kind: 'block',
          type: 'arduino_array_declare_init',
          fields: { TYPE: 'int', NAME: 'miArray', ITEMS: '1, 2, 3' },
        },
        {
          kind: 'block',
          type: 'arduino_array_get',
          fields: { NAME: 'miArray' },
          inputs: { INDEX: num(0) },
        },
        {
          kind: 'block',
          type: 'arduino_array_set',
          fields: { NAME: 'miArray' },
          inputs: { INDEX: num(0), VALUE: num(0) },
        },
        { kind: 'block', type: 'arduino_sizeof', fields: { NAME: 'miArray' } },
      ],
    },
    {
      kind: 'category',
      name: '🔢 Matemáticas',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
        { kind: 'block', type: 'math_trig' },
        { kind: 'block', type: 'arduino_modulo' },
        { kind: 'block', type: 'arduino_min_max', fields: { FN: 'min' } },
        { kind: 'block', type: 'arduino_random', inputs: { MIN: num(0), MAX: num(100) } },
        { kind: 'block', type: 'arduino_random_seed' },
        { kind: 'block', type: 'arduino_cast', fields: { TYPE: 'int' } },
      ],
    },
    {
      kind: 'category',
      name: '🔟 Bits',
      colour: '230',
      contents: [
        { kind: 'block', type: 'arduino_bitwise' },
        { kind: 'block', type: 'arduino_bitwise_not' },
        { kind: 'block', type: 'arduino_bit_read', inputs: { BIT: num(0) } },
        {
          kind: 'block',
          type: 'arduino_bit_write',
          fields: { NAME: 'miVar' },
          inputs: { BIT: num(0), VALUE: num(1) },
        },
        {
          kind: 'block',
          type: 'arduino_bit_set_clear',
          fields: { FN: 'bitSet', NAME: 'miVar' },
          inputs: { BIT: num(0) },
        },
        { kind: 'block', type: 'arduino_bit', inputs: { N: num(3) } },
        { kind: 'block', type: 'arduino_byte_part', fields: { FN: 'lowByte' } },
      ],
    },
    {
      kind: 'category',
      name: '✔️ Lógica',
      colour: '210',
      contents: [
        { kind: 'block', type: 'arduino_compare' },
        { kind: 'block', type: 'arduino_logic' },
        { kind: 'block', type: 'arduino_not' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
      ],
    },
    {
      kind: 'category',
      name: '🔤 Texto',
      colour: '160',
      contents: [
        { kind: 'block', type: 'text', fields: { TEXT: '' } },
        { kind: 'block', type: 'arduino_char', fields: { CHAR: 'A' } },
        { kind: 'block', type: 'arduino_string_cast', inputs: { VALUE: num(0) } },
        { kind: 'block', type: 'arduino_string_length', inputs: { STR: txt('hola') } },
        { kind: 'block', type: 'arduino_string_concat', inputs: { A: txt('Hola '), B: txt('mundo') } },
        {
          kind: 'block',
          type: 'arduino_string_substring',
          inputs: { STR: txt('Hola mundo'), FROM: num(0), TO: num(4) },
        },
        { kind: 'block', type: 'arduino_string_index_of', inputs: { STR: txt('Hola'), SUB: txt('o') } },
        { kind: 'block', type: 'arduino_string_char_at', inputs: { STR: txt('Hola'), INDEX: num(0) } },
        { kind: 'block', type: 'arduino_string_to_number', fields: { FN: 'toInt' } },
        { kind: 'block', type: 'arduino_string_transform', fields: { FN: 'toUpperCase' } },
        { kind: 'block', type: 'arduino_string_compare', fields: { FN: 'equals' } },
        { kind: 'block', type: 'arduino_char_check', fields: { FN: 'isDigit' } },
      ],
    },
    {
      kind: 'category',
      name: '🔊 Audio',
      colour: '290',
      contents: [
        { kind: 'block', type: 'arduino_tone', inputs: { PIN: num(8), FREQ: num(440) } },
        {
          kind: 'block',
          type: 'arduino_tone_duration',
          inputs: { PIN: num(8), FREQ: num(440), DURATION: num(500) },
        },
        { kind: 'block', type: 'arduino_no_tone', inputs: { PIN: num(8) } },
      ],
    },
    {
      kind: 'category',
      name: '🔧 Funciones',
      colour: '270',
      contents: [
        { kind: 'block', type: 'arduino_function_define' },
        { kind: 'block', type: 'arduino_function_call', fields: { NAME: 'miFuncion' } },
        { kind: 'block', type: 'arduino_function_call_expr', fields: { NAME: 'miFuncion' } },
        { kind: 'block', type: 'arduino_return' },
        { kind: 'block', type: 'arduino_return_void' },
      ],
    },
  ],
};

// ── Toolbox para modo Niño / Kids — versión COMPLETA en español ───────────────
export const kidsToolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: '⚙️ Inicio',
      colour: '210',
      contents: [
        { kind: 'block', type: 'kids_setup_loop' },
        { kind: 'block', type: 'kids_comment' },
        { kind: 'block', type: 'kids_define', fields: { NAME: 'LED_PIN', VALUE: '13' } },
        { kind: 'block', type: 'kids_include', fields: { LIB: 'Wire' } },
      ],
    },
    {
      kind: 'category',
      name: '💡 LED y Pines',
      colour: '160',
      contents: [
        { kind: 'block', type: 'kids_pin_mode', fields: { PIN: 13, MODE: 'OUTPUT' } },
        { kind: 'block', type: 'kids_digital_write', fields: { PIN: 13, VALUE: 'HIGH' } },
        { kind: 'block', type: 'kids_digital_read', fields: { PIN: 2 } },
      ],
    },
    {
      kind: 'category',
      name: '📊 Sensores',
      colour: '160',
      contents: [
        {
          kind: 'block', type: 'kids_analog_write', fields: { PIN: 9 },
          inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 128 } } } },
        },
        { kind: 'block', type: 'kids_analog_read', fields: { PIN: 0 } },
        { kind: 'block', type: 'kids_map' },
        { kind: 'block', type: 'kids_constrain' },
      ],
    },
    {
      kind: 'category',
      name: '⏱️ Tiempo',
      colour: '120',
      contents: [
        {
          kind: 'block', type: 'kids_delay',
          inputs: { MS: { block: { type: 'math_number', fields: { NUM: 1000 } } } },
        },
        {
          kind: 'block', type: 'kids_delay_micros',
          inputs: { US: { block: { type: 'math_number', fields: { NUM: 100 } } } },
        },
        { kind: 'block', type: 'kids_millis' },
        { kind: 'block', type: 'kids_micros' },
      ],
    },
    {
      kind: 'category',
      name: '📡 Mensajes',
      colour: '65',
      contents: [
        { kind: 'block', type: 'kids_serial_begin' },
        {
          kind: 'block', type: 'kids_serial_println',
          inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Hola Mundo' } } } },
        },
        {
          kind: 'block', type: 'kids_serial_print',
          inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'valor: ' } } } },
        },
        { kind: 'block', type: 'kids_serial_available' },
        { kind: 'block', type: 'kids_serial_read' },
      ],
    },
    {
      kind: 'category',
      name: '🔁 Repetir',
      colour: '120',
      contents: [
        { kind: 'block', type: 'kids_for' },
        { kind: 'block', type: 'kids_while' },
        { kind: 'block', type: 'kids_do_while' },
        { kind: 'block', type: 'kids_break' },
        { kind: 'block', type: 'kids_continue' },
      ],
    },
    {
      kind: 'category',
      name: '❓ Decisiones',
      colour: '210',
      contents: [
        { kind: 'block', type: 'kids_if_simple' },
        { kind: 'block', type: 'kids_if' },
        { kind: 'block', type: 'kids_switch' },
      ],
    },
    {
      kind: 'category',
      name: '📦 Variables',
      colour: '330',
      contents: [
        {
          kind: 'block', type: 'kids_variable_declare',
          inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } } },
        },
        { kind: 'block', type: 'kids_variable_get' },
        {
          kind: 'block', type: 'kids_variable_set',
          inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } } },
        },
        {
          kind: 'block', type: 'kids_global_var',
          inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } } },
        },
        {
          kind: 'block', type: 'kids_const',
          inputs: { VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } } },
        },
        { kind: 'block', type: 'kids_array_declare' },
        {
          kind: 'block', type: 'kids_array_get',
          inputs: { INDEX: { block: { type: 'math_number', fields: { NUM: 0 } } } },
        },
        {
          kind: 'block', type: 'kids_array_set',
          inputs: {
            INDEX: { block: { type: 'math_number', fields: { NUM: 0 } } },
            VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: '🔢 Números',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
        { kind: 'block', type: 'math_trig' },
      ],
    },
    {
      kind: 'category',
      name: '⚖️ Lógica',
      colour: '210',
      contents: [
        { kind: 'block', type: 'kids_compare' },
        { kind: 'block', type: 'kids_logic' },
        { kind: 'block', type: 'kids_not' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
      ],
    },
    {
      kind: 'category',
      name: '🔤 Texto',
      colour: '160',
      contents: [
        { kind: 'block', type: 'text', fields: { TEXT: '' } },
      ],
    },
    {
      kind: 'category',
      name: '🔊 Sonido',
      colour: '290',
      contents: [
        {
          kind: 'block', type: 'kids_tone', fields: { PIN: 8 },
          inputs: { FREQ: { block: { type: 'math_number', fields: { NUM: 440 } } } },
        },
        { kind: 'block', type: 'kids_no_tone', fields: { PIN: 8 } },
      ],
    },
    {
      kind: 'category',
      name: '🌈 Luces de Colores',
      colour: '0',
      contents: [
        { kind: 'block', type: 'kids_rgb_led' },
        { kind: 'block', type: 'kids_neopixel_setup', fields: { PIN: 6, NUM: 8 } },
        { kind: 'block', type: 'kids_neopixel_brightness', fields: { BRIGHTNESS: 50 } },
        { kind: 'block', type: 'kids_neopixel_color', fields: { PIXEL: 0, R: 255, G: 0, B: 0 } },
        { kind: 'block', type: 'kids_neopixel_show' },
        { kind: 'block', type: 'kids_neopixel_clear' },
      ],
    },
    {
      kind: 'category',
      name: '🧩 Mis Bloques',
      colour: '270',
      contents: [
        { kind: 'block', type: 'kids_function_define' },
        { kind: 'block', type: 'kids_function_call' },
        { kind: 'block', type: 'kids_function_call_expr' },
        { kind: 'block', type: 'kids_return' },
        { kind: 'block', type: 'kids_return_void' },
      ],
    },
  ],
};
