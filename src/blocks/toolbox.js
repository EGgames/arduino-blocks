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
        { kind: 'block', type: 'arduino_define', fields: { NAME: 'LED_BUILTIN', VALUE: '13' } },
        { kind: 'block', type: 'arduino_include', fields: { LIB: 'Wire' } },
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
          fields: { PIN: 13, MODE: 'OUTPUT' },
        },
        {
          kind: 'block',
          type: 'arduino_digital_write',
          fields: { PIN: 13, VALUE: 'HIGH' },
        },
        { kind: 'block', type: 'arduino_digital_read', fields: { PIN: 2 } },
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
          fields: { PIN: 9 },
        },
        { kind: 'block', type: 'arduino_analog_read', fields: { PIN: 0 } },
        {
          kind: 'block',
          type: 'arduino_map',
        },
        {
          kind: 'block',
          type: 'arduino_constrain',
        },
      ],
    },
    {
      kind: 'category',
      name: '⏱️ Tiempo',
      colour: '120',
      contents: [
        {
          kind: 'block',
          type: 'arduino_delay',
          inputs: {
            MS: { block: { type: 'math_number', fields: { NUM: 1000 } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_delay_microseconds',
          inputs: {
            US: { block: { type: 'math_number', fields: { NUM: 100 } } },
          },
        },
        { kind: 'block', type: 'arduino_millis' },
        { kind: 'block', type: 'arduino_micros' },
      ],
    },
    {
      kind: 'category',
      name: '📡 Serial',
      colour: '65',
      contents: [
        {
          kind: 'block',
          type: 'arduino_serial_begin',
          fields: { BAUD: '9600' },
        },
        {
          kind: 'block',
          type: 'arduino_serial_println',
          inputs: {
            TEXT: { block: { type: 'text', fields: { TEXT: 'Hola Arduino' } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_serial_print',
          inputs: {
            TEXT: { block: { type: 'text', fields: { TEXT: 'valor: ' } } },
          },
        },
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
        { kind: 'block', type: 'arduino_for' },
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
          inputs: {
            VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_variable_get',
          fields: { NAME: 'miVar' },
        },
        {
          kind: 'block',
          type: 'arduino_variable_set',
          fields: { NAME: 'miVar' },
          inputs: {
            VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_global_variable_declare',
          fields: { TYPE: 'int', NAME: 'globalVar' },
          inputs: {
            VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_const_define',
          fields: { TYPE: 'int', NAME: 'MI_CONST' },
          inputs: {
            VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_array_declare',
          fields: { TYPE: 'int', NAME: 'miArray', SIZE: 10 },
        },
        {
          kind: 'block',
          type: 'arduino_array_get',
          fields: { NAME: 'miArray' },
          inputs: {
            INDEX: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
        {
          kind: 'block',
          type: 'arduino_array_set',
          fields: { NAME: 'miArray' },
          inputs: {
            INDEX: { block: { type: 'math_number', fields: { NUM: 0 } } },
            VALUE: { block: { type: 'math_number', fields: { NUM: 0 } } },
          },
        },
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
        { kind: 'block', type: 'arduino_bitwise' },
        { kind: 'block', type: 'arduino_bitwise_not' },
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
      ],
    },
    {
      kind: 'category',
      name: '🔊 Audio',
      colour: '290',
      contents: [
        {
          kind: 'block',
          type: 'arduino_tone',
          fields: { PIN: 8 },
          inputs: {
            FREQ: { block: { type: 'math_number', fields: { NUM: 440 } } },
          },
        },
        { kind: 'block', type: 'arduino_no_tone', fields: { PIN: 8 } },
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
