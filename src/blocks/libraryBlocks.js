import * as Blockly from 'blockly';

// ──────────────────────────────────────────────────────────────────────────────
// Definiciones de bloques por librería Arduino
//
// Estructura de cada entrada en LIBRARY_BLOCKS:
//   colour   → tono de color Blockly (0-360)
//   emoji    → emoji para el nombre de categoría
//   blocks   → array de definiciones de bloques, cada una con:
//     type       → identificador único del bloque en Blockly
//     isGlobal   → true = bloque flotante que genera código global (fuera de setup/loop)
//     definition → función (block) → cuerpo de init() de Blockly
//     generator  → función (block, gen) → string | [string, precedencia]
//     toolbox    → { fields?, inputs? } valores por defecto en el panel toolbox
// ──────────────────────────────────────────────────────────────────────────────

export const LIBRARY_BLOCKS = {

  // ── DHT (temperatura/humedad) ──────────────────────────────────────────────
  DHT: {
    colour: 200,
    emoji: '🌡️',
    blocks: [
      {
        type: 'lib_dht_init',
        isGlobal: true,
        toolbox: {},
        definition(block) {
          block.appendDummyInput()
            .appendField('DHT  pin')
            .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN')
            .appendField(new Blockly.FieldDropdown([
              ['DHT11', 'DHT11'], ['DHT22', 'DHT22'], ['DHT21', 'DHT21'],
            ]), 'TYPE');
          block.setColour(200);
          block.setTooltip('Objeto DHT global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `DHT dht(${block.getFieldValue('PIN')}, ${block.getFieldValue('TYPE')});`;
        },
      },
      {
        type: 'lib_dht_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('dht.begin()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(200);
          block.setTooltip('Inicializa el sensor DHT — llamar en setup()');
        },
        generator() { return 'dht.begin();\n'; },
      },
      {
        type: 'lib_dht_read_temp',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput()
            .appendField('dht.readTemperature')
            .appendField(new Blockly.FieldDropdown([['°C', 'false'], ['°F', 'true']]), 'UNIT');
          block.setOutput(true, 'Number');
          block.setColour(200);
          block.setTooltip('Lee la temperatura del sensor DHT');
        },
        generator(block) {
          const f = block.getFieldValue('UNIT') === 'true' ? 'true' : '';
          return [`dht.readTemperature(${f})`, 0];
        },
      },
      {
        type: 'lib_dht_read_humidity',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('dht.readHumidity()');
          block.setOutput(true, 'Number');
          block.setColour(200);
          block.setTooltip('Lee la humedad relativa del DHT (0–100 %)');
        },
        generator() { return ['dht.readHumidity()', 0]; },
      },
    ],
  },

  // ── Servo ──────────────────────────────────────────────────────────────────
  Servo: {
    colour: 20,
    emoji: '🔄',
    blocks: [
      {
        type: 'lib_servo_init',
        isGlobal: true,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('Servo  myServo');
          block.setColour(20);
          block.setTooltip('Objeto Servo global — coloca fuera de setup/loop');
        },
        generator() { return 'Servo myServo;'; },
      },
      {
        type: 'lib_servo_attach',
        isGlobal: false,
        toolbox: { fields: { PIN: 9 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('myServo.attach  pin')
            .appendField(new Blockly.FieldNumber(9, 0, 53), 'PIN');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(20);
          block.setTooltip('Conecta el servo a un pin PWM (~)');
        },
        generator(block) {
          return `myServo.attach(${block.getFieldValue('PIN')});\n`;
        },
      },
      {
        type: 'lib_servo_write',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('ANGLE').setCheck('Number').appendField('myServo.write  ángulo');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(20);
          block.setTooltip('Mueve el servo al ángulo indicado (0–180°)');
        },
        generator(block, gen) {
          const a = gen.valueToCode(block, 'ANGLE', gen.ORDER_ATOMIC) || '90';
          return `myServo.write(${a});\n`;
        },
      },
      {
        type: 'lib_servo_read',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('myServo.read()');
          block.setOutput(true, 'Number');
          block.setColour(20);
          block.setTooltip('Devuelve el último ángulo enviado al servo (0–180°)');
        },
        generator() { return ['myServo.read()', 0]; },
      },
      {
        type: 'lib_servo_detach',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('myServo.detach()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(20);
          block.setTooltip('Desconecta el servo del pin (el pin deja de enviar pulsos PWM)');
        },
        generator() { return 'myServo.detach();\n'; },
      },
    ],
  },

  // ── LiquidCrystal_I2C ──────────────────────────────────────────────────────
  LiquidCrystal_I2C: {
    colour: 260,
    emoji: '📺',
    blocks: [
      {
        type: 'lib_lcd_i2c_init',
        isGlobal: true,
        toolbox: { fields: { ADDR: '0x27', COLS: 16, ROWS: 2 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('LiquidCrystal_I2C  lcd  addr')
            .appendField(new Blockly.FieldTextInput('0x27'), 'ADDR')
            .appendField('cols')
            .appendField(new Blockly.FieldNumber(16, 1, 40), 'COLS')
            .appendField('rows')
            .appendField(new Blockly.FieldNumber(2, 1, 4), 'ROWS');
          block.setColour(260);
          block.setTooltip('Objeto LCD I2C global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `LiquidCrystal_I2C lcd(${block.getFieldValue('ADDR')}, ${block.getFieldValue('COLS')}, ${block.getFieldValue('ROWS')});`;
        },
      },
      {
        type: 'lib_lcd_i2c_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('lcd.init()  +  backlight');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(260);
          block.setTooltip('Inicializa el LCD I2C y enciende la luz de fondo');
        },
        generator() { return 'lcd.init();\nlcd.backlight();\n'; },
      },
      {
        type: 'lib_lcd_i2c_clear',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('lcd.clear()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(260);
          block.setTooltip('Borra todo el contenido del LCD');
        },
        generator() { return 'lcd.clear();\n'; },
      },
      {
        type: 'lib_lcd_i2c_set_cursor',
        isGlobal: false,
        toolbox: { fields: { COL: 0, ROW: 0 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('lcd.setCursor  col')
            .appendField(new Blockly.FieldNumber(0, 0, 39), 'COL')
            .appendField('fila')
            .appendField(new Blockly.FieldNumber(0, 0, 3), 'ROW');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(260);
          block.setTooltip('Posiciona el cursor en columna / fila');
        },
        generator(block) {
          return `lcd.setCursor(${block.getFieldValue('COL')}, ${block.getFieldValue('ROW')});\n`;
        },
      },
      {
        type: 'lib_lcd_i2c_print',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('TEXT').appendField('lcd.print');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(260);
          block.setTooltip('Muestra un texto o valor en el LCD');
        },
        generator(block, gen) {
          const t = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || '"Hola"';
          return `lcd.print(${t});\n`;
        },
      },
      {
        type: 'lib_lcd_i2c_backlight',
        isGlobal: false,
        toolbox: { fields: { STATE: 'ON' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('lcd  luz de fondo')
            .appendField(new Blockly.FieldDropdown([['ON', 'ON'], ['OFF', 'OFF']]), 'STATE');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(260);
          block.setTooltip('Enciende o apaga la luz de fondo del LCD');
        },
        generator(block) {
          return block.getFieldValue('STATE') === 'ON' ? 'lcd.backlight();\n' : 'lcd.noBacklight();\n';
        },
      },
    ],
  },

  // ── LiquidCrystal (paralelo) ───────────────────────────────────────────────
  LiquidCrystal: {
    colour: 250,
    emoji: '📺',
    blocks: [
      {
        type: 'lib_lcd_init',
        isGlobal: true,
        toolbox: { fields: { RS: 12, EN: 11, D4: 5, D5: 4, D6: 3, D7: 2 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('LiquidCrystal  lcd  rs')
            .appendField(new Blockly.FieldNumber(12, 0, 53), 'RS')
            .appendField('en')
            .appendField(new Blockly.FieldNumber(11, 0, 53), 'EN');
          block.appendDummyInput()
            .appendField('d4')
            .appendField(new Blockly.FieldNumber(5, 0, 53), 'D4')
            .appendField('d5')
            .appendField(new Blockly.FieldNumber(4, 0, 53), 'D5')
            .appendField('d6')
            .appendField(new Blockly.FieldNumber(3, 0, 53), 'D6')
            .appendField('d7')
            .appendField(new Blockly.FieldNumber(2, 0, 53), 'D7');
          block.setColour(250);
          block.setTooltip('Objeto LiquidCrystal global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `LiquidCrystal lcd(${block.getFieldValue('RS')}, ${block.getFieldValue('EN')}, ${block.getFieldValue('D4')}, ${block.getFieldValue('D5')}, ${block.getFieldValue('D6')}, ${block.getFieldValue('D7')});`;
        },
      },
      {
        type: 'lib_lcd_begin',
        isGlobal: false,
        toolbox: { fields: { COLS: 16, ROWS: 2 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('lcd.begin  cols')
            .appendField(new Blockly.FieldNumber(16, 1, 40), 'COLS')
            .appendField('filas')
            .appendField(new Blockly.FieldNumber(2, 1, 4), 'ROWS');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(250);
          block.setTooltip('Inicializa el LCD con sus dimensiones');
        },
        generator(block) {
          return `lcd.begin(${block.getFieldValue('COLS')}, ${block.getFieldValue('ROWS')});\n`;
        },
      },
      {
        type: 'lib_lcd_clear',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('lcd.clear()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(250);
          block.setTooltip('Borra todo el contenido del LCD');
        },
        generator() { return 'lcd.clear();\n'; },
      },
      {
        type: 'lib_lcd_set_cursor',
        isGlobal: false,
        toolbox: { fields: { COL: 0, ROW: 0 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('lcd.setCursor  col')
            .appendField(new Blockly.FieldNumber(0, 0, 39), 'COL')
            .appendField('fila')
            .appendField(new Blockly.FieldNumber(0, 0, 3), 'ROW');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(250);
          block.setTooltip('Posiciona el cursor en columna / fila');
        },
        generator(block) {
          return `lcd.setCursor(${block.getFieldValue('COL')}, ${block.getFieldValue('ROW')});\n`;
        },
      },
      {
        type: 'lib_lcd_print',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('TEXT').appendField('lcd.print');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(250);
          block.setTooltip('Muestra un texto o valor en el LCD');
        },
        generator(block, gen) {
          const t = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || '"Hola"';
          return `lcd.print(${t});\n`;
        },
      },
    ],
  },

  // ── Wire (I2C) ─────────────────────────────────────────────────────────────
  Wire: {
    colour: 180,
    emoji: '🔗',
    blocks: [
      {
        type: 'lib_wire_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('Wire.begin()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(180);
          block.setTooltip('Inicializa I2C como maestro');
        },
        generator() { return 'Wire.begin();\n'; },
      },
      {
        type: 'lib_wire_begin_tx',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('ADDR').setCheck('Number').appendField('Wire.beginTransmission');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(180);
          block.setTooltip('Inicia transmisión I2C a la dirección indicada');
        },
        generator(block, gen) {
          const a = gen.valueToCode(block, 'ADDR', gen.ORDER_ATOMIC) || '0x3C';
          return `Wire.beginTransmission(${a});\n`;
        },
      },
      {
        type: 'lib_wire_write',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('DATA').setCheck('Number').appendField('Wire.write');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(180);
          block.setTooltip('Envía un byte por I2C');
        },
        generator(block, gen) {
          const d = gen.valueToCode(block, 'DATA', gen.ORDER_ATOMIC) || '0';
          return `Wire.write(${d});\n`;
        },
      },
      {
        type: 'lib_wire_end_tx',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('Wire.endTransmission()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(180);
          block.setTooltip('Finaliza la transmisión I2C');
        },
        generator() { return 'Wire.endTransmission();\n'; },
      },
      {
        type: 'lib_wire_request_from',
        isGlobal: false,
        toolbox: { fields: { COUNT: 6 } },
        definition(block) {
          block.appendValueInput('ADDR').setCheck('Number').appendField('Wire.requestFrom  addr');
          block.appendDummyInput()
            .appendField('bytes')
            .appendField(new Blockly.FieldNumber(6, 1, 32), 'COUNT');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(180);
          block.setTooltip('Solicita bytes de un dispositivo I2C esclavo');
        },
        generator(block, gen) {
          const a = gen.valueToCode(block, 'ADDR', gen.ORDER_ATOMIC) || '0x3C';
          return `Wire.requestFrom(${a}, ${block.getFieldValue('COUNT')});\n`;
        },
      },
      {
        type: 'lib_wire_read',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('Wire.read()');
          block.setOutput(true, 'Number');
          block.setColour(180);
          block.setTooltip('Lee el siguiente byte del buffer I2C');
        },
        generator() { return ['Wire.read()', 0]; },
      },
      {
        type: 'lib_wire_available',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('Wire.available()');
          block.setOutput(true, 'Number');
          block.setColour(180);
          block.setTooltip('Bytes disponibles en el buffer I2C');
        },
        generator() { return ['Wire.available()', 0]; },
      },
    ],
  },

  // ── Adafruit_NeoPixel ──────────────────────────────────────────────────────
  Adafruit_NeoPixel: {
    colour: 300,
    emoji: '💡',
    blocks: [
      {
        type: 'lib_neopixel_init',
        isGlobal: true,
        toolbox: { fields: { COUNT: 8, PIN: 6 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('NeoPixel  strip  LEDs')
            .appendField(new Blockly.FieldNumber(8, 1, 500), 'COUNT')
            .appendField('pin')
            .appendField(new Blockly.FieldNumber(6, 0, 53), 'PIN');
          block.setColour(300);
          block.setTooltip('Objeto NeoPixel global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `Adafruit_NeoPixel strip(${block.getFieldValue('COUNT')}, ${block.getFieldValue('PIN')}, NEO_GRB + NEO_KHZ800);`;
        },
      },
      {
        type: 'lib_neopixel_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('strip.begin()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(300);
          block.setTooltip('Inicializa la tira NeoPixel — llamar en setup()');
        },
        generator() { return 'strip.begin();\n'; },
      },
      {
        type: 'lib_neopixel_show',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('strip.show()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(300);
          block.setTooltip('Actualiza la tira LED con los colores configurados');
        },
        generator() { return 'strip.show();\n'; },
      },
      {
        type: 'lib_neopixel_set_pixel',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('INDEX').setCheck('Number').appendField('strip.setPixelColor  LED');
          block.appendValueInput('R').setCheck('Number').appendField('R');
          block.appendValueInput('G').setCheck('Number').appendField('G');
          block.appendValueInput('B').setCheck('Number').appendField('B');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(300);
          block.setTooltip('Color RGB de un LED (índice 0-based, valores 0–255)');
        },
        generator(block, gen) {
          const i = gen.valueToCode(block, 'INDEX', gen.ORDER_ATOMIC) || '0';
          const r = gen.valueToCode(block, 'R', gen.ORDER_ATOMIC) || '255';
          const g = gen.valueToCode(block, 'G', gen.ORDER_ATOMIC) || '0';
          const b = gen.valueToCode(block, 'B', gen.ORDER_ATOMIC) || '0';
          return `strip.setPixelColor(${i}, strip.Color(${r}, ${g}, ${b}));\n`;
        },
      },
      {
        type: 'lib_neopixel_fill',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('R').setCheck('Number').appendField('strip.fill  R');
          block.appendValueInput('G').setCheck('Number').appendField('G');
          block.appendValueInput('B').setCheck('Number').appendField('B');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(300);
          block.setTooltip('Rellena toda la tira con un color RGB');
        },
        generator(block, gen) {
          const r = gen.valueToCode(block, 'R', gen.ORDER_ATOMIC) || '0';
          const g = gen.valueToCode(block, 'G', gen.ORDER_ATOMIC) || '0';
          const b = gen.valueToCode(block, 'B', gen.ORDER_ATOMIC) || '0';
          return `strip.fill(strip.Color(${r}, ${g}, ${b}));\n`;
        },
      },
      {
        type: 'lib_neopixel_clear',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('strip.clear()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(300);
          block.setTooltip('Apaga todos los LEDs de la tira');
        },
        generator() { return 'strip.clear();\n'; },
      },
      {
        type: 'lib_neopixel_brightness',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('VAL').setCheck('Number').appendField('strip.setBrightness');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(300);
          block.setTooltip('Brillo global de la tira (0–255)');
        },
        generator(block, gen) {
          const v = gen.valueToCode(block, 'VAL', gen.ORDER_ATOMIC) || '128';
          return `strip.setBrightness(${v});\n`;
        },
      },
    ],
  },

  // ── EEPROM ─────────────────────────────────────────────────────────────────
  EEPROM: {
    colour: 30,
    emoji: '💾',
    blocks: [
      {
        type: 'lib_eeprom_read',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('ADDR').setCheck('Number').appendField('EEPROM.read  addr');
          block.setOutput(true, 'Number');
          block.setColour(30);
          block.setTooltip('Lee 1 byte de la EEPROM (addr 0–1023)');
        },
        generator(block, gen) {
          const a = gen.valueToCode(block, 'ADDR', gen.ORDER_ATOMIC) || '0';
          return [`EEPROM.read(${a})`, 0];
        },
      },
      {
        type: 'lib_eeprom_write',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('ADDR').setCheck('Number').appendField('EEPROM.write  addr');
          block.appendValueInput('VALUE').setCheck('Number').appendField('valor');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(30);
          block.setTooltip('Escribe 1 byte en la EEPROM (desgasta la memoria si se repite)');
        },
        generator(block, gen) {
          const a = gen.valueToCode(block, 'ADDR', gen.ORDER_ATOMIC) || '0';
          const v = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || '0';
          return `EEPROM.write(${a}, ${v});\n`;
        },
      },
      {
        type: 'lib_eeprom_update',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('ADDR').setCheck('Number').appendField('EEPROM.update  addr');
          block.appendValueInput('VALUE').setCheck('Number').appendField('valor');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(30);
          block.setTooltip('Escribe solo si el valor cambió — más eficiente que write()');
        },
        generator(block, gen) {
          const a = gen.valueToCode(block, 'ADDR', gen.ORDER_ATOMIC) || '0';
          const v = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || '0';
          return `EEPROM.update(${a}, ${v});\n`;
        },
      },
    ],
  },

  // ── NewPing (ultrasonido) ──────────────────────────────────────────────────
  NewPing: {
    colour: 170,
    emoji: '📡',
    blocks: [
      {
        type: 'lib_newping_init',
        isGlobal: true,
        toolbox: { fields: { TRIG: 12, ECHO: 11, MAX: 200 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('NewPing  sonar  trig')
            .appendField(new Blockly.FieldNumber(12, 0, 53), 'TRIG')
            .appendField('echo')
            .appendField(new Blockly.FieldNumber(11, 0, 53), 'ECHO')
            .appendField('max cm')
            .appendField(new Blockly.FieldNumber(200, 1, 500), 'MAX');
          block.setColour(170);
          block.setTooltip('Objeto NewPing global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `NewPing sonar(${block.getFieldValue('TRIG')}, ${block.getFieldValue('ECHO')}, ${block.getFieldValue('MAX')});`;
        },
      },
      {
        type: 'lib_newping_ping_cm',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('sonar.ping_cm()');
          block.setOutput(true, 'Number');
          block.setColour(170);
          block.setTooltip('Distancia al obstáculo en cm (0 = sin eco)');
        },
        generator() { return ['sonar.ping_cm()', 0]; },
      },
      {
        type: 'lib_newping_ping_in',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('sonar.ping_in()');
          block.setOutput(true, 'Number');
          block.setColour(170);
          block.setTooltip('Distancia al obstáculo en pulgadas');
        },
        generator() { return ['sonar.ping_in()', 0]; },
      },
    ],
  },

  // ── SoftwareSerial ─────────────────────────────────────────────────────────
  SoftwareSerial: {
    colour: 65,
    emoji: '📟',
    blocks: [
      {
        type: 'lib_softserial_init',
        isGlobal: true,
        toolbox: { fields: { RX: 10, TX: 11 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('SoftwareSerial  mySerial  rx')
            .appendField(new Blockly.FieldNumber(10, 0, 53), 'RX')
            .appendField('tx')
            .appendField(new Blockly.FieldNumber(11, 0, 53), 'TX');
          block.setColour(65);
          block.setTooltip('Objeto SoftwareSerial global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `SoftwareSerial mySerial(${block.getFieldValue('RX')}, ${block.getFieldValue('TX')});`;
        },
      },
      {
        type: 'lib_softserial_begin',
        isGlobal: false,
        toolbox: { fields: { BAUD: '9600' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('mySerial.begin')
            .appendField(new Blockly.FieldDropdown([
              ['9600', '9600'], ['115200', '115200'], ['57600', '57600'],
              ['38400', '38400'], ['19200', '19200'], ['4800', '4800'],
            ]), 'BAUD');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(65);
          block.setTooltip('Inicia el puerto serial software a la velocidad indicada');
        },
        generator(block) {
          return `mySerial.begin(${block.getFieldValue('BAUD')});\n`;
        },
      },
      {
        type: 'lib_softserial_print',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('DATA').appendField('mySerial.print');
          block.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
              ['sin nueva línea', 'print'], ['con nueva línea', 'println'],
            ]), 'MODE');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(65);
          block.setTooltip('Envía datos por el puerto serial software');
        },
        generator(block, gen) {
          const d = gen.valueToCode(block, 'DATA', gen.ORDER_ATOMIC) || '""';
          return `mySerial.${block.getFieldValue('MODE')}(${d});\n`;
        },
      },
      {
        type: 'lib_softserial_read',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('mySerial.read()');
          block.setOutput(true, 'Number');
          block.setColour(65);
          block.setTooltip('Lee un byte del buffer serial software');
        },
        generator() { return ['mySerial.read()', 0]; },
      },
      {
        type: 'lib_softserial_available',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('mySerial.available()');
          block.setOutput(true, 'Number');
          block.setColour(65);
          block.setTooltip('Bytes disponibles en el buffer serial software');
        },
        generator() { return ['mySerial.available()', 0]; },
      },
    ],
  },

  // ── Stepper ────────────────────────────────────────────────────────────────
  Stepper: {
    colour: 10,
    emoji: '🔩',
    blocks: [
      {
        type: 'lib_stepper_init',
        isGlobal: true,
        toolbox: { fields: { STEPS: 200, P1: 8, P2: 9, P3: 10, P4: 11 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('Stepper  stepper  pasos/rev')
            .appendField(new Blockly.FieldNumber(200, 1, 2000), 'STEPS');
          block.appendDummyInput()
            .appendField('pines')
            .appendField(new Blockly.FieldNumber(8, 0, 53), 'P1')
            .appendField(new Blockly.FieldNumber(9, 0, 53), 'P2')
            .appendField(new Blockly.FieldNumber(10, 0, 53), 'P3')
            .appendField(new Blockly.FieldNumber(11, 0, 53), 'P4');
          block.setColour(10);
          block.setTooltip('Objeto Stepper global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `Stepper stepper(${block.getFieldValue('STEPS')}, ${block.getFieldValue('P1')}, ${block.getFieldValue('P2')}, ${block.getFieldValue('P3')}, ${block.getFieldValue('P4')});`;
        },
      },
      {
        type: 'lib_stepper_speed',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('RPM').setCheck('Number').appendField('stepper.setSpeed  RPM');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(10);
          block.setTooltip('Establece la velocidad del motor paso a paso en RPM');
        },
        generator(block, gen) {
          const r = gen.valueToCode(block, 'RPM', gen.ORDER_ATOMIC) || '60';
          return `stepper.setSpeed(${r});\n`;
        },
      },
      {
        type: 'lib_stepper_step',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('STEPS').setCheck('Number').appendField('stepper.step  pasos');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(10);
          block.setTooltip('Mueve el número de pasos indicado (negativo = sentido inverso)');
        },
        generator(block, gen) {
          const s = gen.valueToCode(block, 'STEPS', gen.ORDER_ATOMIC) || '100';
          return `stepper.step(${s});\n`;
        },
      },
    ],
  },

  // ── Bounce2 ────────────────────────────────────────────────────────────────
  Bounce2: {
    colour: 120,
    emoji: '🔘',
    blocks: [
      {
        type: 'lib_bounce2_init',
        isGlobal: true,
        toolbox: { fields: { PIN: 2 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('Bounce2  button  pin')
            .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN');
          block.setColour(120);
          block.setTooltip('Declara botón con anti-rebote Bounce2 — coloca fuera de setup/loop');
        },
        generator(block) {
          const pin = block.getFieldValue('PIN');
          return `Bounce2::Button button;\nbutton.attach(${pin}, INPUT_PULLUP);\nbutton.interval(5);`;
        },
      },
      {
        type: 'lib_bounce2_update',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('button.update()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(120);
          block.setTooltip('Actualiza el estado del botón — llamar al inicio de cada loop()');
        },
        generator() { return 'button.update();\n'; },
      },
      {
        type: 'lib_bounce2_fell',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('button.fell()');
          block.setOutput(true, 'Boolean');
          block.setColour(120);
          block.setTooltip('true cuando el botón fue presionado (flanco de bajada)');
        },
        generator() { return ['button.fell()', 0]; },
      },
      {
        type: 'lib_bounce2_rose',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('button.rose()');
          block.setOutput(true, 'Boolean');
          block.setColour(120);
          block.setTooltip('true cuando el botón fue soltado (flanco de subida)');
        },
        generator() { return ['button.rose()', 0]; },
      },
      {
        type: 'lib_bounce2_read',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('button.read()');
          block.setOutput(true, 'Boolean');
          block.setColour(120);
          block.setTooltip('Estado actual del botón tras el anti-rebote');
        },
        generator() { return ['button.read()', 0]; },
      },
    ],
  },

  // ── RTClib ─────────────────────────────────────────────────────────────────
  RTClib: {
    colour: 45,
    emoji: '⏰',
    blocks: [
      {
        type: 'lib_rtclib_init',
        isGlobal: true,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('RTC_DS3231  rtc');
          block.setColour(45);
          block.setTooltip('Objeto RTC DS3231 global — coloca fuera de setup/loop');
        },
        generator() { return 'RTC_DS3231 rtc;'; },
      },
      {
        type: 'lib_rtclib_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('rtc.begin()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(45);
          block.setTooltip('Inicializa el módulo RTC DS3231');
        },
        generator() { return 'rtc.begin();\n'; },
      },
      {
        type: 'lib_rtclib_get_field',
        isGlobal: false,
        toolbox: { fields: { FIELD: 'hour' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('rtc.now().')
            .appendField(new Blockly.FieldDropdown([
              ['hora', 'hour'], ['minuto', 'minute'], ['segundo', 'second'],
              ['día', 'day'], ['mes', 'month'], ['año', 'year'],
            ]), 'FIELD')
            .appendField('()');
          block.setOutput(true, 'Number');
          block.setColour(45);
          block.setTooltip('Obtiene un campo de fecha/hora del RTC');
        },
        generator(block) {
          return [`rtc.now().${block.getFieldValue('FIELD')}()`, 0];
        },
      },
    ],
  },

  // ── Adafruit_SSD1306 (OLED) ────────────────────────────────────────────────
  Adafruit_SSD1306: {
    colour: 220,
    emoji: '📟',
    blocks: [
      {
        type: 'lib_ssd1306_init',
        isGlobal: true,
        toolbox: { fields: { W: 128, H: 64 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('Adafruit_SSD1306  display')
            .appendField(new Blockly.FieldNumber(128, 64, 256), 'W')
            .appendField('×')
            .appendField(new Blockly.FieldNumber(64, 16, 128), 'H');
          block.setColour(220);
          block.setTooltip('Objeto OLED SSD1306 global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `Adafruit_SSD1306 display(${block.getFieldValue('W')}, ${block.getFieldValue('H')}, &Wire, -1);`;
        },
      },
      {
        type: 'lib_ssd1306_begin',
        isGlobal: false,
        toolbox: { fields: { ADDR: '0x3C' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('display.begin  addr')
            .appendField(new Blockly.FieldTextInput('0x3C'), 'ADDR');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Inicializa la pantalla OLED por I2C');
        },
        generator(block) {
          return `display.begin(SSD1306_SWITCHCAPVCC, ${block.getFieldValue('ADDR')});\n`;
        },
      },
      {
        type: 'lib_ssd1306_clear',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('display.clearDisplay()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Borra el buffer de la pantalla OLED');
        },
        generator() { return 'display.clearDisplay();\n'; },
      },
      {
        type: 'lib_ssd1306_display',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('display.display()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Envía el buffer a la pantalla (sin esto no se ven los cambios)');
        },
        generator() { return 'display.display();\n'; },
      },
      {
        type: 'lib_ssd1306_set_cursor',
        isGlobal: false,
        toolbox: { fields: { X: 0, Y: 0 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('display.setCursor  x')
            .appendField(new Blockly.FieldNumber(0, 0, 127), 'X')
            .appendField('y')
            .appendField(new Blockly.FieldNumber(0, 0, 63), 'Y');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Mueve el cursor al píxel indicado');
        },
        generator(block) {
          return `display.setCursor(${block.getFieldValue('X')}, ${block.getFieldValue('Y')});\n`;
        },
      },
      {
        type: 'lib_ssd1306_print',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('TEXT').appendField('display.print');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Escribe texto o un valor en el buffer OLED');
        },
        generator(block, gen) {
          const t = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || '"Hola"';
          return `display.print(${t});\n`;
        },
      },
      {
        type: 'lib_ssd1306_text_size',
        isGlobal: false,
        toolbox: { fields: { SIZE: 1 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('display.setTextSize')
            .appendField(new Blockly.FieldNumber(1, 1, 8), 'SIZE');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Tamaño del texto (1=pequeño, 2=mediano, …)');
        },
        generator(block) {
          return `display.setTextSize(${block.getFieldValue('SIZE')});\n`;
        },
      },
      {
        type: 'lib_ssd1306_text_color',
        isGlobal: false,
        toolbox: { fields: { COLOR: 'WHITE' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('display.setTextColor')
            .appendField(new Blockly.FieldDropdown([['blanco', 'WHITE'], ['negro', 'BLACK']]), 'COLOR');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(220);
          block.setTooltip('Color del texto en el OLED');
        },
        generator(block) {
          return `display.setTextColor(${block.getFieldValue('COLOR')});\n`;
        },
      },
    ],
  },

  // ── MPU6050 (acelerómetro/giroscopio) ─────────────────────────────────────
  MPU6050: {
    colour: 190,
    emoji: '🎯',
    blocks: [
      {
        type: 'lib_mpu6050_init',
        isGlobal: true,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('MPU6050  mpu');
          block.setColour(190);
          block.setTooltip('Objeto MPU6050 global — coloca fuera de setup/loop');
        },
        generator() { return 'MPU6050 mpu;'; },
      },
      {
        type: 'lib_mpu6050_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('mpu.begin()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(190);
          block.setTooltip('Inicializa el MPU6050 por I2C');
        },
        generator() { return 'mpu.begin();\n'; },
      },
      {
        type: 'lib_mpu6050_get_event',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('mpu  leer datos  →  a, g, temp');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(190);
          block.setTooltip('Lee aceleración, giroscopio y temperatura en variables a, g, temp');
        },
        generator() {
          return 'sensors_event_t a, g, temp;\nmpu.getEvent(&a, &g, &temp);\n';
        },
      },
      {
        type: 'lib_mpu6050_accel',
        isGlobal: false,
        toolbox: { fields: { AXIS: 'x' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('aceleración  eje')
            .appendField(new Blockly.FieldDropdown([['X', 'x'], ['Y', 'y'], ['Z', 'z']]), 'AXIS');
          block.setOutput(true, 'Number');
          block.setColour(190);
          block.setTooltip('Aceleración en el eje indicado (m/s²) — usar tras "mpu leer datos"');
        },
        generator(block) {
          return [`a.acceleration.${block.getFieldValue('AXIS')}`, 0];
        },
      },
      {
        type: 'lib_mpu6050_gyro',
        isGlobal: false,
        toolbox: { fields: { AXIS: 'x' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('giroscopio  eje')
            .appendField(new Blockly.FieldDropdown([['X', 'x'], ['Y', 'y'], ['Z', 'z']]), 'AXIS');
          block.setOutput(true, 'Number');
          block.setColour(190);
          block.setTooltip('Velocidad angular en el eje indicado (rad/s)');
        },
        generator(block) {
          return [`g.gyro.${block.getFieldValue('AXIS')}`, 0];
        },
      },
    ],
  },

  // ── DallasTemperature (DS18B20) ────────────────────────────────────────────
  DallasTemperature: {
    colour: 205,
    emoji: '🌡️',
    blocks: [
      {
        type: 'lib_dallas_init',
        isGlobal: true,
        toolbox: { fields: { PIN: 2 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('DallasTemperature  sensors  pin')
            .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN');
          block.setColour(205);
          block.setTooltip('Crea objetos OneWire + DallasTemperature globales — coloca fuera de setup/loop');
        },
        generator(block) {
          return `OneWire oneWire(${block.getFieldValue('PIN')});\nDallasTemperature sensors(&oneWire);`;
        },
      },
      {
        type: 'lib_dallas_begin',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('sensors.begin()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(205);
          block.setTooltip('Inicializa los sensores Dallas en el bus OneWire');
        },
        generator() { return 'sensors.begin();\n'; },
      },
      {
        type: 'lib_dallas_request',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('sensors.requestTemperatures()');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(205);
          block.setTooltip('Solicita la temperatura a todos los sensores del bus');
        },
        generator() { return 'sensors.requestTemperatures();\n'; },
      },
      {
        type: 'lib_dallas_get_temp',
        isGlobal: false,
        toolbox: { fields: { INDEX: 0, UNIT: 'C' } },
        definition(block) {
          block.appendDummyInput()
            .appendField('sensors  temperatura  índice')
            .appendField(new Blockly.FieldNumber(0, 0, 9), 'INDEX')
            .appendField(new Blockly.FieldDropdown([['°C', 'C'], ['°F', 'F']]), 'UNIT');
          block.setOutput(true, 'Number');
          block.setColour(205);
          block.setTooltip('Temperatura del sensor en el índice indicado');
        },
        generator(block) {
          const fn = block.getFieldValue('UNIT') === 'C' ? 'getTempCByIndex' : 'getTempFByIndex';
          return [`sensors.${fn}(${block.getFieldValue('INDEX')})`, 0];
        },
      },
    ],
  },

  // ── Encoder ────────────────────────────────────────────────────────────────
  Encoder: {
    colour: 90,
    emoji: '🎛️',
    blocks: [
      {
        type: 'lib_encoder_init',
        isGlobal: true,
        toolbox: { fields: { PIN1: 2, PIN2: 3 } },
        definition(block) {
          block.appendDummyInput()
            .appendField('Encoder  enc  pin1')
            .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN1')
            .appendField('pin2')
            .appendField(new Blockly.FieldNumber(3, 0, 53), 'PIN2');
          block.setColour(90);
          block.setTooltip('Objeto Encoder global — coloca fuera de setup/loop');
        },
        generator(block) {
          return `Encoder enc(${block.getFieldValue('PIN1')}, ${block.getFieldValue('PIN2')});`;
        },
      },
      {
        type: 'lib_encoder_read',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('enc.read()');
          block.setOutput(true, 'Number');
          block.setColour(90);
          block.setTooltip('Lee la posición acumulada del encoder');
        },
        generator() { return ['enc.read()', 0]; },
      },
      {
        type: 'lib_encoder_write',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendValueInput('VALUE').setCheck('Number').appendField('enc.write');
          block.setPreviousStatement(true, null);
          block.setNextStatement(true, null);
          block.setColour(90);
          block.setTooltip('Establece el valor del contador del encoder');
        },
        generator(block, gen) {
          const v = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || '0';
          return `enc.write(${v});\n`;
        },
      },
    ],
  },

  // ── Keypad ─────────────────────────────────────────────────────────────────
  Keypad: {
    colour: 60,
    emoji: '⌨️',
    blocks: [
      {
        type: 'lib_keypad_init',
        isGlobal: true,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('Keypad  keypad  (4×4 por defecto)');
          block.setColour(60);
          block.setTooltip('Declara el teclado matricial Keypad 4×4 con pines predeterminados — edita el código generado si necesitas otra distribución');
        },
        generator() {
          return [
            "char keys[4][4] = {{'1','2','3','A'},{'4','5','6','B'},{'7','8','9','C'},{'*','0','#','D'}};",
            'byte rowPins[4] = {9, 8, 7, 6};',
            'byte colPins[4] = {5, 4, 3, 2};',
            'Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, 4, 4);',
          ].join('\n');
        },
      },
      {
        type: 'lib_keypad_get_key',
        isGlobal: false,
        toolbox: {},
        definition(block) {
          block.appendDummyInput().appendField('keypad.getKey()');
          block.setOutput(true, 'String');
          block.setColour(60);
          block.setTooltip('Devuelve la tecla presionada (o NO_KEY si ninguna)');
        },
        generator() { return ['keypad.getKey()', 0]; },
      },
    ],
  },
};

// ── Registro en Blockly ────────────────────────────────────────────────────────

/** Set de tipos ya registrados — evita redefinir bloques en hot-reload */
const _registeredLibTypes = new Set();

/**
 * Registra todos los bloques Blockly de una librería (solo si no están ya registrados).
 * @param {string} libName - nombre de la librería (clave en LIBRARY_BLOCKS)
 * @param {import('./arduinoGenerator').ArduinoGenerator} generator
 * @returns {boolean} true si la librería tiene definición de bloques
 */
export function registerLibraryBlocks(libName, generator) {
  const def = LIBRARY_BLOCKS[libName];
  if (!def) return false;

  for (const b of def.blocks) {
    if (_registeredLibTypes.has(b.type)) continue;
    _registeredLibTypes.add(b.type);

    // Definición del bloque en Blockly
    Blockly.Blocks[b.type] = {
      init() { b.definition(this); },
    };

    // Generador de código Arduino
    generator.forBlock[b.type] = (block) => b.generator(block, generator);

    // Si es global, registrarlo para la pasada de declaraciones
    if (b.isGlobal) {
      generator.addGlobalLibraryBlockType(b.type);
    }
  }
  return true;
}

/**
 * Genera el objeto de categoría de toolbox para una librería.
 * @param {string} libName
 * @returns {object|null}
 */
export function buildLibraryToolboxCategory(libName) {
  const def = LIBRARY_BLOCKS[libName];
  if (!def) return null;

  return {
    kind: 'category',
    name: `${def.emoji} ${libName}`,
    colour: String(def.colour),
    contents: def.blocks.map((b) => {
      const entry = { kind: 'block', type: b.type };
      if (b.toolbox?.fields) entry.fields = b.toolbox.fields;
      if (b.toolbox?.inputs) entry.inputs = b.toolbox.inputs;
      return entry;
    }),
  };
}

// ── Bloques genéricos de fallback para librerías custom ───────────────────────
// Estos tres bloques son compartidos entre todas las librerías desconocidas.
// Se registran una sola vez la primera vez que se necesitan.

let _fallbackRegistered = false;

/**
 * Registra los bloques genéricos de librería custom (solo una vez).
 * @param {object} generator
 */
export function registerFallbackBlocks(generator) {
  if (_fallbackRegistered) return;
  _fallbackRegistered = true;

  // ── lib_custom_global_decl ─────────────────────────────────────────────────
  // Declaración global libre (p.ej. "MyLib myObj;")
  Blockly.Blocks['lib_custom_global_decl'] = {
    init() {
      this.appendDummyInput()
        .appendField('📦 declaración global')
        .appendField(new Blockly.FieldTextInput('MyLib myObj'), 'DECL');
      this.setColour(150);
      this.setTooltip(
        'Escribe una línea de declaración global de tu librería custom (se coloca antes de setup).\n' +
        'Ejemplo: MyLib myObj(5);'
      );
    },
  };
  generator.forBlock['lib_custom_global_decl'] = (block) => {
    const decl = block.getFieldValue('DECL').trim();
    // Añadir punto y coma si no lo tiene
    return decl.endsWith(';') ? decl : decl + ';';
  };
  generator.addGlobalLibraryBlockType('lib_custom_global_decl');

  // ── lib_custom_call_void ───────────────────────────────────────────────────
  // Llamada a función sin retorno (instrucción)
  Blockly.Blocks['lib_custom_call_void'] = {
    init() {
      this.appendDummyInput()
        .appendField('📦 llamar')
        .appendField(new Blockly.FieldTextInput('myObj.begin()'), 'CALL');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(150);
      this.setTooltip(
        'Llama a cualquier función de tu librería custom (sin valor de retorno).\n' +
        'Ejemplo: myObj.doSomething(param1, param2);'
      );
    },
  };
  generator.forBlock['lib_custom_call_void'] = (block) => {
    const call = block.getFieldValue('CALL').trim();
    return (call.endsWith(';') ? call : call + ';') + '\n';
  };

  // ── lib_custom_call_return ─────────────────────────────────────────────────
  // Llamada a función con valor de retorno (expresión)
  Blockly.Blocks['lib_custom_call_return'] = {
    init() {
      this.appendDummyInput()
        .appendField('📦 valor de')
        .appendField(new Blockly.FieldTextInput('myObj.getValue()'), 'CALL');
      this.setOutput(true, null);
      this.setColour(150);
      this.setTooltip(
        'Llama a una función de tu librería custom que devuelve un valor.\n' +
        'Ejemplo: myObj.readSensor()'
      );
    },
  };
  generator.forBlock['lib_custom_call_return'] = (block) => {
    const call = block.getFieldValue('CALL').trim().replace(/;$/, '');
    return [call, 0];
  };
}

/**
 * Crea una categoría de toolbox genérica para una librería sin bloques predefinidos.
 * Siempre registra los bloques fallback antes de construir la categoría.
 * @param {string} libName
 * @param {object} generator
 * @returns {object}
 */
export function buildFallbackLibraryToolboxCategory(libName, generator) {
  registerFallbackBlocks(generator);
  return {
    kind: 'category',
    name: `📦 ${libName}`,
    colour: '150',
    contents: [
      {
        kind: 'block',
        type: 'lib_custom_global_decl',
        fields: { DECL: `${libName} obj` },
      },
      {
        kind: 'block',
        type: 'lib_custom_call_void',
        fields: { CALL: `obj.begin()` },
      },
      {
        kind: 'block',
        type: 'lib_custom_call_return',
        fields: { CALL: `obj.read()` },
      },
    ],
  };
}
