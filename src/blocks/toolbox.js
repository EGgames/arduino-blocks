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
