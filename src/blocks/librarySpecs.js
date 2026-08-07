import { buildLibraryBlocksFromSpecs } from './libraryBlockFactory';

// ──────────────────────────────────────────────────────────────────────────────
// Especificaciones declarativas de bloques para el resto del catálogo de
// librerías Arduino (las que no tienen bloques escritos a mano en
// libraryBlocks.js). Con esto TODAS las librerías de ARDUINO_LIBRARIES se
// pueden traducir a bloques.
//
// Helpers:
//   G(type, label, code, extra) → declaración global (fuera de setup/loop)
//   S(type, label, code, extra) → sentencia
//   V(type, label, code, extra) → expresión con valor de retorno
// ──────────────────────────────────────────────────────────────────────────────

const G = (type, label, code, extra = {}) => ({ type, kind: 'global', label, code, ...extra });
const S = (type, label, code, extra = {}) => ({ type, kind: 'statement', label, code, ...extra });
const V = (type, label, code, extra = {}) => ({ type, kind: 'value', label, code, ...extra });

/** Campo numérico */
const numF = (name, def, label, min = 0, max = 100000) =>
  ({ name, kind: 'num', default: def, label, min, max });
/** Campo de texto libre */
const textF = (name, def, label) => ({ name, kind: 'text', default: def, label });
/** Campo desplegable */
const dropF = (name, options, def, label) =>
  ({ name, kind: 'dropdown', options, default: def ?? options[0][1], label });
/** Hueco de valor numérico */
const numI = (name, def, label) => ({ name, default: String(def), label, check: 'Number' });
/** Hueco de valor de texto */
const strI = (name, def, label) => ({ name, default: `"${def}"`, label, shadowText: true });

const BAUD_OPTS = [['9600', '9600'], ['19200', '19200'], ['38400', '38400'],
  ['57600', '57600'], ['115200', '115200']];
const AXIS_OPTS = [['X', 'x'], ['Y', 'y'], ['Z', 'z']];
const BIT_ORDER = [['MSBFIRST', 'MSBFIRST'], ['LSBFIRST', 'LSBFIRST']];

export const LIBRARY_SPECS = {

  // ── SPI ────────────────────────────────────────────────────────────────────
  SPI: {
    colour: 175, emoji: '🔗',
    blocks: [
      S('lib_spi_begin', 'SPI.begin()', 'SPI.begin()', { tooltip: 'Inicializa el bus SPI' }),
      S('lib_spi_begin_tx', 'SPI.beginTransaction', 'SPI.beginTransaction(SPISettings({SPEED}, {ORDER}, {MODE}))', {
        fields: [
          numF('SPEED', 4000000, 'velocidad', 1000, 20000000),
          dropF('ORDER', BIT_ORDER, undefined, 'orden'),
          dropF('MODE', [['SPI_MODE0', 'SPI_MODE0'], ['SPI_MODE1', 'SPI_MODE1'],
            ['SPI_MODE2', 'SPI_MODE2'], ['SPI_MODE3', 'SPI_MODE3']], 'SPI_MODE0', 'modo'),
        ],
        tooltip: 'Abre una transacción SPI con velocidad, orden de bits y modo',
      }),
      V('lib_spi_transfer', 'SPI.transfer', 'SPI.transfer({DATA})', {
        inputs: [numI('DATA', 0, 'byte')], output: 'Number',
        tooltip: 'Envía un byte y devuelve el byte recibido',
      }),
      S('lib_spi_end_tx', 'SPI.endTransaction()', 'SPI.endTransaction()'),
      S('lib_spi_end', 'SPI.end()', 'SPI.end()'),
    ],
  },

  // ── OneWire ────────────────────────────────────────────────────────────────
  OneWire: {
    colour: 185, emoji: '🔗',
    blocks: [
      G('lib_onewire_init', 'OneWire  oneWire  pin', 'OneWire oneWire({PIN})', {
        fields: [numF('PIN', 2, '', 0, 53)],
        tooltip: 'Objeto OneWire global — coloca fuera de setup/loop',
      }),
      V('lib_onewire_reset', 'oneWire.reset()', 'oneWire.reset()', { output: 'Number' }),
      S('lib_onewire_write', 'oneWire.write', 'oneWire.write({DATA})', { inputs: [numI('DATA', 0, 'byte')] }),
      V('lib_onewire_read', 'oneWire.read()', 'oneWire.read()', { output: 'Number' }),
      V('lib_onewire_search', 'oneWire.search(addr)', 'oneWire.search(addr)', { output: 'Boolean' }),
    ],
  },

  // ── IRremote ───────────────────────────────────────────────────────────────
  IRremote: {
    colour: 340, emoji: '📶',
    blocks: [
      G('lib_irremote_recv_init', 'IRrecv  irrecv  pin', 'IRrecv irrecv({PIN})', {
        fields: [numF('PIN', 11, '', 0, 53)],
      }),
      S('lib_irremote_enable', 'irrecv.enableIRIn()', 'irrecv.enableIRIn()'),
      V('lib_irremote_decode', 'irrecv.decode()', 'irrecv.decode()', { output: 'Boolean' }),
      V('lib_irremote_value', 'código IR recibido', 'irrecv.decodedIRData.decodedRawData', { output: 'Number' }),
      S('lib_irremote_resume', 'irrecv.resume()', 'irrecv.resume()'),
      G('lib_irremote_send_init', 'IRsend  irsend', 'IRsend irsend'),
      S('lib_irremote_send', 'irsend.sendNEC', 'irsend.sendNEC({CODE}, 32)', { inputs: [numI('CODE', 0, 'código')] }),
    ],
  },

  // ── CAN ────────────────────────────────────────────────────────────────────
  CAN: {
    colour: 15, emoji: '🚗',
    blocks: [
      S('lib_can_begin', 'CAN.begin', 'CAN.begin({SPEED})', {
        fields: [dropF('SPEED', [['500 kbps', '500E3'], ['250 kbps', '250E3'], ['1 Mbps', '1000E3']], '500E3', 'velocidad')],
      }),
      S('lib_can_begin_packet', 'CAN.beginPacket', 'CAN.beginPacket({ID})', { inputs: [numI('ID', 18, 'id')] }),
      S('lib_can_write', 'CAN.write', 'CAN.write({DATA})', { inputs: [numI('DATA', 0, 'byte')] }),
      S('lib_can_end_packet', 'CAN.endPacket()', 'CAN.endPacket()'),
      V('lib_can_parse', 'CAN.parsePacket()', 'CAN.parsePacket()', { output: 'Number' }),
      V('lib_can_read', 'CAN.read()', 'CAN.read()', { output: 'Number' }),
    ],
  },

  // ── RS485 ──────────────────────────────────────────────────────────────────
  RS485: {
    colour: 35, emoji: '🔌',
    blocks: [
      S('lib_rs485_begin', 'RS485.begin', 'RS485.begin({BAUD})', { fields: [dropF('BAUD', BAUD_OPTS, '9600')] }),
      S('lib_rs485_begin_tx', 'RS485.beginTransmission()', 'RS485.beginTransmission()'),
      S('lib_rs485_write', 'RS485.write', 'RS485.write({DATA})', { inputs: [numI('DATA', 0, 'byte')] }),
      S('lib_rs485_end_tx', 'RS485.endTransmission()', 'RS485.endTransmission()'),
      S('lib_rs485_receive', 'RS485.receive()', 'RS485.receive()'),
      V('lib_rs485_available', 'RS485.available()', 'RS485.available()', { output: 'Number' }),
      V('lib_rs485_read', 'RS485.read()', 'RS485.read()', { output: 'Number' }),
    ],
  },

  // ── Adafruit_BMP280 ────────────────────────────────────────────────────────
  Adafruit_BMP280: {
    colour: 212, emoji: '🌡️',
    blocks: [
      G('lib_bmp280_init', 'Adafruit_BMP280  bmp', 'Adafruit_BMP280 bmp'),
      S('lib_bmp280_begin', 'bmp.begin  addr', 'bmp.begin({ADDR})', { fields: [textF('ADDR', '0x76')] }),
      V('lib_bmp280_temp', 'bmp.readTemperature()', 'bmp.readTemperature()', { output: 'Number' }),
      V('lib_bmp280_pressure', 'bmp.readPressure()', 'bmp.readPressure()', { output: 'Number' }),
      V('lib_bmp280_altitude', 'bmp.readAltitude()', 'bmp.readAltitude(1013.25)', { output: 'Number' }),
    ],
  },

  // ── Adafruit_BME280 ────────────────────────────────────────────────────────
  Adafruit_BME280: {
    colour: 208, emoji: '🌡️',
    blocks: [
      G('lib_bme280_init', 'Adafruit_BME280  bme', 'Adafruit_BME280 bme'),
      S('lib_bme280_begin', 'bme.begin  addr', 'bme.begin({ADDR})', { fields: [textF('ADDR', '0x76')] }),
      V('lib_bme280_temp', 'bme.readTemperature()', 'bme.readTemperature()', { output: 'Number' }),
      V('lib_bme280_humidity', 'bme.readHumidity()', 'bme.readHumidity()', { output: 'Number' }),
      V('lib_bme280_pressure', 'bme.readPressure()', 'bme.readPressure()', { output: 'Number' }),
    ],
  },

  // ── Adafruit_ADXL345 ───────────────────────────────────────────────────────
  Adafruit_ADXL345: {
    colour: 195, emoji: '🎯',
    blocks: [
      G('lib_adxl345_init', 'ADXL345  accel', 'Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345)'),
      S('lib_adxl345_begin', 'accel.begin()', 'accel.begin()'),
      S('lib_adxl345_event', 'accel  leer datos', 'sensors_event_t event;\naccel.getEvent(&event)', {
        tooltip: 'Lee la aceleración en la variable event',
      }),
      V('lib_adxl345_axis', 'aceleración eje', 'event.acceleration.{AXIS}', {
        fields: [dropF('AXIS', AXIS_OPTS, 'x')], output: 'Number',
      }),
    ],
  },

  // ── CapacitiveSensor ───────────────────────────────────────────────────────
  CapacitiveSensor: {
    colour: 55, emoji: '⚡',
    blocks: [
      G('lib_capsense_init', 'CapacitiveSensor  capSensor', 'CapacitiveSensor capSensor = CapacitiveSensor({SEND}, {RECV})', {
        fields: [numF('SEND', 4, 'envío', 0, 53), numF('RECV', 2, 'recepción', 0, 53)],
      }),
      V('lib_capsense_read', 'capSensor.capacitiveSensor', 'capSensor.capacitiveSensor({SAMPLES})', {
        fields: [numF('SAMPLES', 30, 'muestras', 1, 1000)], output: 'Number',
      }),
    ],
  },

  // ── Sharp_IR ───────────────────────────────────────────────────────────────
  Sharp_IR: {
    colour: 165, emoji: '📏',
    blocks: [
      V('lib_sharp_raw', 'Sharp  lectura cruda  A', 'analogRead(A{PIN})', {
        fields: [numF('PIN', 0, '', 0, 15)], output: 'Number',
      }),
      V('lib_sharp_distance', 'Sharp  distancia cm  A', '((6787.0 / (analogRead(A{PIN}) - 3.0)) - 4.0)', {
        fields: [numF('PIN', 0, '', 0, 15)], output: 'Number',
        tooltip: 'Distancia aproximada en cm para el GP2Y0A21 (10–80 cm)',
      }),
    ],
  },

  // ── MQ2 ────────────────────────────────────────────────────────────────────
  MQ2: {
    colour: 25, emoji: '💨',
    blocks: [
      V('lib_mq2_read', 'MQ-2  lectura  A', 'analogRead(A{PIN})', {
        fields: [numF('PIN', 0, '', 0, 15)], output: 'Number',
      }),
      V('lib_mq2_voltage', 'MQ-2  voltaje  A', '(analogRead(A{PIN}) * 5.0 / 1023.0)', {
        fields: [numF('PIN', 0, '', 0, 15)], output: 'Number',
      }),
      V('lib_mq2_alarm', 'MQ-2  supera umbral  A', '(analogRead(A{PIN}) > {THRESHOLD})', {
        fields: [numF('PIN', 0, '', 0, 15), numF('THRESHOLD', 400, 'umbral', 0, 1023)],
        output: 'Boolean',
      }),
    ],
  },

  // ── Adafruit_GFX ───────────────────────────────────────────────────────────
  Adafruit_GFX: {
    colour: 225, emoji: '🖼️',
    blocks: [
      S('lib_gfx_pixel', 'display.drawPixel', 'display.drawPixel({X}, {Y}, {COLOR})', {
        inputs: [numI('X', 0, 'x'), numI('Y', 0, 'y')],
        fields: [dropF('COLOR', [['blanco', 'WHITE'], ['negro', 'BLACK']], 'WHITE', 'color')],
      }),
      S('lib_gfx_line', 'display.drawLine', 'display.drawLine({X0}, {Y0}, {X1}, {Y1}, WHITE)', {
        inputs: [numI('X0', 0, 'x0'), numI('Y0', 0, 'y0'), numI('X1', 20, 'x1'), numI('Y1', 20, 'y1')],
      }),
      S('lib_gfx_rect', 'display  rectángulo', 'display.{FN}({X}, {Y}, {W}, {H}, WHITE)', {
        fields: [dropF('FN', [['contorno', 'drawRect'], ['relleno', 'fillRect']], 'drawRect')],
        inputs: [numI('X', 0, 'x'), numI('Y', 0, 'y'), numI('W', 20, 'ancho'), numI('H', 10, 'alto')],
      }),
      S('lib_gfx_circle', 'display  círculo', 'display.{FN}({X}, {Y}, {R}, WHITE)', {
        fields: [dropF('FN', [['contorno', 'drawCircle'], ['relleno', 'fillCircle']], 'drawCircle')],
        inputs: [numI('X', 32, 'x'), numI('Y', 32, 'y'), numI('R', 10, 'radio')],
      }),
      S('lib_gfx_rotation', 'display.setRotation', 'display.setRotation({R})', {
        fields: [dropF('R', [['0°', '0'], ['90°', '1'], ['180°', '2'], ['270°', '3']], '0')],
      }),
    ],
  },

  // ── TM1637Display ──────────────────────────────────────────────────────────
  TM1637Display: {
    colour: 40, emoji: '🔢',
    blocks: [
      G('lib_tm1637_init', 'TM1637  display', 'TM1637Display display({CLK}, {DIO})', {
        fields: [numF('CLK', 2, 'clk', 0, 53), numF('DIO', 3, 'dio', 0, 53)],
      }),
      S('lib_tm1637_brightness', 'display.setBrightness', 'display.setBrightness({LEVEL})', {
        fields: [numF('LEVEL', 7, '', 0, 7)],
      }),
      S('lib_tm1637_show', 'display.showNumberDec', 'display.showNumberDec({VALUE})', {
        inputs: [numI('VALUE', 0, 'número')],
      }),
      S('lib_tm1637_clear', 'display.clear()', 'display.clear()'),
    ],
  },

  // ── U8g2 ───────────────────────────────────────────────────────────────────
  U8g2: {
    colour: 235, emoji: '📟',
    blocks: [
      G('lib_u8g2_init', 'U8g2  u8g2  (SSD1306 I2C)', 'U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE)'),
      S('lib_u8g2_begin', 'u8g2.begin()', 'u8g2.begin()'),
      S('lib_u8g2_clear', 'u8g2.clearBuffer()', 'u8g2.clearBuffer()'),
      S('lib_u8g2_font', 'u8g2.setFont', 'u8g2.setFont({FONT})', {
        fields: [dropF('FONT', [
          ['pequeña', 'u8g2_font_6x10_tf'],
          ['mediana', 'u8g2_font_ncenB08_tr'],
          ['grande', 'u8g2_font_ncenB14_tr'],
        ], 'u8g2_font_6x10_tf')],
      }),
      S('lib_u8g2_str', 'u8g2.drawStr', 'u8g2.drawStr({X}, {Y}, {TEXT})', {
        inputs: [numI('X', 0, 'x'), numI('Y', 10, 'y'), strI('TEXT', 'Hola', 'texto')],
      }),
      S('lib_u8g2_send', 'u8g2.sendBuffer()', 'u8g2.sendBuffer()'),
    ],
  },

  // ── Adafruit_ILI9341 ───────────────────────────────────────────────────────
  Adafruit_ILI9341: {
    colour: 215, emoji: '🖥️',
    blocks: [
      G('lib_ili9341_init', 'ILI9341  tft', 'Adafruit_ILI9341 tft = Adafruit_ILI9341({CS}, {DC}, {RST})', {
        fields: [numF('CS', 10, 'cs', 0, 53), numF('DC', 9, 'dc', 0, 53), numF('RST', 8, 'rst', 0, 53)],
      }),
      S('lib_ili9341_begin', 'tft.begin()', 'tft.begin()'),
      S('lib_ili9341_fill', 'tft.fillScreen', 'tft.fillScreen({COLOR})', {
        fields: [dropF('COLOR', [
          ['negro', 'ILI9341_BLACK'], ['blanco', 'ILI9341_WHITE'], ['rojo', 'ILI9341_RED'],
          ['verde', 'ILI9341_GREEN'], ['azul', 'ILI9341_BLUE'],
        ], 'ILI9341_BLACK')],
      }),
      S('lib_ili9341_cursor', 'tft.setCursor', 'tft.setCursor({X}, {Y})', {
        inputs: [numI('X', 0, 'x'), numI('Y', 0, 'y')],
      }),
      S('lib_ili9341_text_size', 'tft.setTextSize', 'tft.setTextSize({SIZE})', {
        fields: [numF('SIZE', 2, '', 1, 8)],
      }),
      S('lib_ili9341_print', 'tft.print', 'tft.print({TEXT})', { inputs: [strI('TEXT', 'Hola', '')] }),
    ],
  },

  // ── MAX7219 (LedControl) ───────────────────────────────────────────────────
  MAX7219: {
    colour: 50, emoji: '🔲',
    blocks: [
      G('lib_max7219_init', 'LedControl  lc', 'LedControl lc = LedControl({DIN}, {CLK}, {CS}, {DEVICES})', {
        fields: [numF('DIN', 12, 'din', 0, 53), numF('CLK', 11, 'clk', 0, 53),
          numF('CS', 10, 'cs', 0, 53), numF('DEVICES', 1, 'matrices', 1, 8)],
      }),
      S('lib_max7219_wake', 'lc  encender', 'lc.shutdown(0, false)'),
      S('lib_max7219_brightness', 'lc.setIntensity', 'lc.setIntensity(0, {LEVEL})', {
        fields: [numF('LEVEL', 8, '', 0, 15)],
      }),
      S('lib_max7219_clear', 'lc.clearDisplay(0)', 'lc.clearDisplay(0)'),
      S('lib_max7219_set_led', 'lc.setLed', 'lc.setLed(0, {ROW}, {COL}, {STATE})', {
        inputs: [numI('ROW', 0, 'fila'), numI('COL', 0, 'columna')],
        fields: [dropF('STATE', [['encendido', 'true'], ['apagado', 'false']], 'true', 'estado')],
      }),
    ],
  },

  // ── FastLED ────────────────────────────────────────────────────────────────
  FastLED: {
    colour: 305, emoji: '🌈',
    blocks: [
      G('lib_fastled_init', 'CRGB  leds  cantidad', 'CRGB leds[{NUM}]', {
        fields: [numF('NUM', 30, '', 1, 1000)],
      }),
      S('lib_fastled_setup', 'FastLED.addLeds  pin', 'FastLED.addLeds<WS2812B, {PIN}, GRB>(leds, {NUM})', {
        fields: [numF('PIN', 6, '', 0, 53), numF('NUM', 30, 'leds', 1, 1000)],
      }),
      S('lib_fastled_brightness', 'FastLED.setBrightness', 'FastLED.setBrightness({LEVEL})', {
        inputs: [numI('LEVEL', 64, '')],
      }),
      S('lib_fastled_set', 'leds[i] = color', 'leds[{INDEX}] = CRGB({R}, {G}, {B})', {
        inputs: [numI('INDEX', 0, 'led'), numI('R', 255, 'R'), numI('G', 0, 'G'), numI('B', 0, 'B')],
      }),
      S('lib_fastled_fill', 'fill_solid  toda la tira', 'fill_solid(leds, {NUM}, CRGB({R}, {G}, {B}))', {
        fields: [numF('NUM', 30, 'leds', 1, 1000)],
        inputs: [numI('R', 0, 'R'), numI('G', 0, 'G'), numI('B', 255, 'B')],
      }),
      S('lib_fastled_show', 'FastLED.show()', 'FastLED.show()'),
      S('lib_fastled_clear', 'FastLED.clear()', 'FastLED.clear()'),
    ],
  },

  // ── AccelStepper ───────────────────────────────────────────────────────────
  AccelStepper: {
    colour: 5, emoji: '🔩',
    blocks: [
      G('lib_accelstepper_init', 'AccelStepper  stepper  pines', 'AccelStepper stepper(AccelStepper::FULL4WIRE, {P1}, {P2}, {P3}, {P4})', {
        fields: [numF('P1', 8, '', 0, 53), numF('P2', 9, '', 0, 53), numF('P3', 10, '', 0, 53), numF('P4', 11, '', 0, 53)],
      }),
      S('lib_accelstepper_max_speed', 'stepper.setMaxSpeed', 'stepper.setMaxSpeed({V})', { inputs: [numI('V', 200, '')] }),
      S('lib_accelstepper_accel', 'stepper.setAcceleration', 'stepper.setAcceleration({A})', { inputs: [numI('A', 100, '')] }),
      S('lib_accelstepper_move_to', 'stepper.moveTo', 'stepper.moveTo({POS})', { inputs: [numI('POS', 500, 'posición')] }),
      S('lib_accelstepper_run', 'stepper.run()', 'stepper.run()', { tooltip: 'Llamar en cada loop() para que el motor avance' }),
      V('lib_accelstepper_position', 'stepper.currentPosition()', 'stepper.currentPosition()', { output: 'Number' }),
    ],
  },

  // ── AFMotor ────────────────────────────────────────────────────────────────
  AFMotor: {
    colour: 355, emoji: '🚗',
    blocks: [
      G('lib_afmotor_init', 'AF_DCMotor  motor  puerto', 'AF_DCMotor motor({PORT})', {
        fields: [dropF('PORT', [['M1', '1'], ['M2', '2'], ['M3', '3'], ['M4', '4']], '1')],
      }),
      S('lib_afmotor_speed', 'motor.setSpeed', 'motor.setSpeed({V})', { inputs: [numI('V', 200, '0-255')] }),
      S('lib_afmotor_run', 'motor.run', 'motor.run({DIR})', {
        fields: [dropF('DIR', [['adelante', 'FORWARD'], ['atrás', 'BACKWARD'], ['soltar', 'RELEASE']], 'FORWARD')],
      }),
    ],
  },

  // ── WiFi ───────────────────────────────────────────────────────────────────
  WiFi: {
    colour: 196, emoji: '📶',
    blocks: [
      S('lib_wifi_begin', 'WiFi.begin', 'WiFi.begin({SSID}, {PASS})', {
        inputs: [strI('SSID', 'MiRed', 'red'), strI('PASS', 'clave', 'clave')],
      }),
      V('lib_wifi_connected', 'WiFi conectado', '(WiFi.status() == WL_CONNECTED)', { output: 'Boolean' }),
      V('lib_wifi_status', 'WiFi.status()', 'WiFi.status()', { output: 'Number' }),
      V('lib_wifi_ip', 'WiFi.localIP()', 'WiFi.localIP()'),
      V('lib_wifi_rssi', 'WiFi.RSSI()', 'WiFi.RSSI()', { output: 'Number' }),
      S('lib_wifi_disconnect', 'WiFi.disconnect()', 'WiFi.disconnect()'),
    ],
  },

  // ── WiFiNINA ───────────────────────────────────────────────────────────────
  WiFiNINA: {
    colour: 198, emoji: '📶',
    blocks: [
      S('lib_wifinina_begin', 'WiFi.begin (NINA)', 'WiFi.begin({SSID}, {PASS})', {
        inputs: [strI('SSID', 'MiRed', 'red'), strI('PASS', 'clave', 'clave')],
      }),
      V('lib_wifinina_connected', 'WiFi conectado (NINA)', '(WiFi.status() == WL_CONNECTED)', { output: 'Boolean' }),
      V('lib_wifinina_ip', 'WiFi.localIP() (NINA)', 'WiFi.localIP()'),
      G('lib_wifinina_client', 'WiFiClient  client', 'WiFiClient client'),
    ],
  },

  // ── WiFiEspAT ──────────────────────────────────────────────────────────────
  WiFiEspAT: {
    colour: 200, emoji: '📶',
    blocks: [
      S('lib_wifiespat_init', 'WiFi.init (Serial1)', 'WiFi.init(Serial1)'),
      S('lib_wifiespat_begin', 'WiFi.begin (ESP-AT)', 'WiFi.begin({SSID}, {PASS})', {
        inputs: [strI('SSID', 'MiRed', 'red'), strI('PASS', 'clave', 'clave')],
      }),
      V('lib_wifiespat_connected', 'WiFi conectado (ESP-AT)', '(WiFi.status() == WL_CONNECTED)', { output: 'Boolean' }),
    ],
  },

  // ── Ethernet ───────────────────────────────────────────────────────────────
  Ethernet: {
    colour: 202, emoji: '🌐',
    blocks: [
      G('lib_ethernet_mac', 'byte  mac[]', 'byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED}'),
      S('lib_ethernet_begin', 'Ethernet.begin(mac)', 'Ethernet.begin(mac)'),
      V('lib_ethernet_ip', 'Ethernet.localIP()', 'Ethernet.localIP()'),
      G('lib_ethernet_client', 'EthernetClient  client', 'EthernetClient client'),
    ],
  },

  // ── PubSubClient (MQTT) ────────────────────────────────────────────────────
  PubSubClient: {
    colour: 240, emoji: '📨',
    blocks: [
      G('lib_mqtt_init', 'PubSubClient  mqtt', 'WiFiClient espClient;\nPubSubClient mqtt(espClient)'),
      S('lib_mqtt_server', 'mqtt.setServer', 'mqtt.setServer({HOST}, {PORT})', {
        inputs: [strI('HOST', 'broker.hivemq.com', 'broker')],
        fields: [numF('PORT', 1883, 'puerto', 1, 65535)],
      }),
      V('lib_mqtt_connect', 'mqtt.connect', 'mqtt.connect({ID})', {
        inputs: [strI('ID', 'arduinoCliente', 'id')], output: 'Boolean',
      }),
      S('lib_mqtt_publish', 'mqtt.publish', 'mqtt.publish({TOPIC}, {PAYLOAD})', {
        inputs: [strI('TOPIC', 'casa/led', 'tema'), strI('PAYLOAD', 'ON', 'mensaje')],
      }),
      S('lib_mqtt_subscribe', 'mqtt.subscribe', 'mqtt.subscribe({TOPIC})', {
        inputs: [strI('TOPIC', 'casa/led', 'tema')],
      }),
      S('lib_mqtt_loop', 'mqtt.loop()', 'mqtt.loop()'),
      V('lib_mqtt_connected', 'mqtt.connected()', 'mqtt.connected()', { output: 'Boolean' }),
    ],
  },

  // ── ArduinoHttpClient ──────────────────────────────────────────────────────
  ArduinoHttpClient: {
    colour: 206, emoji: '🌍',
    blocks: [
      G('lib_http_init', 'HttpClient  http', 'WiFiClient wifiClient;\nHttpClient http = HttpClient(wifiClient, {HOST}, {PORT})', {
        fields: [textF('HOST', '"example.com"', 'host'), numF('PORT', 80, 'puerto', 1, 65535)],
      }),
      S('lib_http_get', 'http.get', 'http.get({PATH})', { inputs: [strI('PATH', '/', 'ruta')] }),
      S('lib_http_post', 'http.post', 'http.post({PATH}, "application/json", {BODY})', {
        inputs: [strI('PATH', '/api', 'ruta'), strI('BODY', '{}', 'cuerpo')],
      }),
      V('lib_http_status', 'http.responseStatusCode()', 'http.responseStatusCode()', { output: 'Number' }),
      V('lib_http_body', 'http.responseBody()', 'http.responseBody()', { output: 'String' }),
    ],
  },

  // ── SD ─────────────────────────────────────────────────────────────────────
  SD: {
    colour: 22, emoji: '💾',
    blocks: [
      S('lib_sd_begin', 'SD.begin  CS', 'SD.begin({CS})', { fields: [numF('CS', 4, '', 0, 53)] }),
      S('lib_sd_open', 'abrir archivo', 'File dataFile = SD.open({NAME}, {MODE})', {
        inputs: [strI('NAME', 'datos.txt', 'nombre')],
        fields: [dropF('MODE', [['escritura', 'FILE_WRITE'], ['lectura', 'FILE_READ']], 'FILE_WRITE', 'modo')],
      }),
      S('lib_sd_println', 'dataFile.println', 'dataFile.println({DATA})', { inputs: [strI('DATA', 'hola', '')] }),
      V('lib_sd_read', 'dataFile.read()', 'dataFile.read()', { output: 'Number' }),
      S('lib_sd_close', 'dataFile.close()', 'dataFile.close()'),
      V('lib_sd_exists', 'SD.exists', 'SD.exists({NAME})', {
        inputs: [strI('NAME', 'datos.txt', '')], output: 'Boolean',
      }),
      S('lib_sd_remove', 'SD.remove', 'SD.remove({NAME})', { inputs: [strI('NAME', 'datos.txt', '')] }),
    ],
  },

  // ── Preferences (ESP32) ────────────────────────────────────────────────────
  Preferences: {
    colour: 100, emoji: '💾',
    blocks: [
      G('lib_prefs_init', 'Preferences  prefs', 'Preferences prefs'),
      S('lib_prefs_begin', 'prefs.begin', 'prefs.begin({NS}, false)', { inputs: [strI('NS', 'app', 'espacio')] }),
      S('lib_prefs_put', 'prefs.putInt', 'prefs.putInt({KEY}, {VALUE})', {
        inputs: [strI('KEY', 'contador', 'clave'), numI('VALUE', 0, 'valor')],
      }),
      V('lib_prefs_get', 'prefs.getInt', 'prefs.getInt({KEY}, 0)', {
        inputs: [strI('KEY', 'contador', 'clave')], output: 'Number',
      }),
      S('lib_prefs_end', 'prefs.end()', 'prefs.end()'),
    ],
  },

  // ── FlashStorage ───────────────────────────────────────────────────────────
  FlashStorage: {
    colour: 110, emoji: '💾',
    blocks: [
      G('lib_flash_init', 'FlashStorage  almacen (int)', 'FlashStorage(almacen, int)'),
      S('lib_flash_write', 'almacen.write', 'almacen.write({VALUE})', { inputs: [numI('VALUE', 0, '')] }),
      V('lib_flash_read', 'almacen.read()', 'almacen.read()', { output: 'Number' }),
    ],
  },

  // ── MFRC522 (RFID) ─────────────────────────────────────────────────────────
  MFRC522: {
    colour: 285, emoji: '🪪',
    blocks: [
      G('lib_mfrc522_init', 'MFRC522  mfrc522', 'MFRC522 mfrc522({SS}, {RST})', {
        fields: [numF('SS', 10, 'ss', 0, 53), numF('RST', 9, 'rst', 0, 53)],
      }),
      S('lib_mfrc522_begin', 'mfrc522  iniciar', 'SPI.begin();\nmfrc522.PCD_Init()'),
      V('lib_mfrc522_new_card', 'hay tarjeta nueva', 'mfrc522.PICC_IsNewCardPresent()', { output: 'Boolean' }),
      V('lib_mfrc522_read_serial', 'leer serie de la tarjeta', 'mfrc522.PICC_ReadCardSerial()', { output: 'Boolean' }),
      V('lib_mfrc522_uid_byte', 'UID byte', 'mfrc522.uid.uidByte[{INDEX}]', {
        inputs: [numI('INDEX', 0, '')], output: 'Number',
      }),
      S('lib_mfrc522_halt', 'mfrc522.PICC_HaltA()', 'mfrc522.PICC_HaltA()'),
    ],
  },

  // ── Adafruit_Fingerprint ───────────────────────────────────────────────────
  Adafruit_Fingerprint: {
    colour: 295, emoji: '☝️',
    blocks: [
      G('lib_fingerprint_init', 'Adafruit_Fingerprint  finger', 'SoftwareSerial fingerSerial(2, 3);\nAdafruit_Fingerprint finger = Adafruit_Fingerprint(&fingerSerial)'),
      S('lib_fingerprint_begin', 'finger.begin(57600)', 'finger.begin(57600)'),
      V('lib_fingerprint_verify', 'finger.verifyPassword()', 'finger.verifyPassword()', { output: 'Boolean' }),
      V('lib_fingerprint_get_image', 'finger.getImage()', 'finger.getImage()', { output: 'Number' }),
      V('lib_fingerprint_search', 'finger.fingerFastSearch()', 'finger.fingerFastSearch()', { output: 'Number' }),
      V('lib_fingerprint_id', 'finger.fingerID', 'finger.fingerID', { output: 'Number' }),
    ],
  },

  // ── TimeLib ────────────────────────────────────────────────────────────────
  TimeLib: {
    colour: 42, emoji: '⏰',
    blocks: [
      S('lib_timelib_set', 'setTime', 'setTime({H}, {M}, {S}, {D}, {MO}, {Y})', {
        fields: [numF('H', 12, 'h', 0, 23), numF('M', 0, 'min', 0, 59), numF('S', 0, 's', 0, 59),
          numF('D', 1, 'día', 1, 31), numF('MO', 1, 'mes', 1, 12), numF('Y', 2025, 'año', 1970, 2100)],
      }),
      V('lib_timelib_get', 'obtener', '{FN}()', {
        fields: [dropF('FN', [['hora', 'hour'], ['minuto', 'minute'], ['segundo', 'second'],
          ['día', 'day'], ['mes', 'month'], ['año', 'year']], 'hour')],
        output: 'Number',
      }),
      V('lib_timelib_now', 'now()', 'now()', { output: 'Number' }),
    ],
  },

  // ── NTPClient ──────────────────────────────────────────────────────────────
  NTPClient: {
    colour: 48, emoji: '🕐',
    blocks: [
      G('lib_ntp_init', 'NTPClient  timeClient', 'WiFiUDP ntpUDP;\nNTPClient timeClient(ntpUDP, "pool.ntp.org", {OFFSET})', {
        fields: [numF('OFFSET', 0, 'desfase s', -43200, 43200)],
      }),
      S('lib_ntp_begin', 'timeClient.begin()', 'timeClient.begin()'),
      S('lib_ntp_update', 'timeClient.update()', 'timeClient.update()'),
      V('lib_ntp_formatted', 'timeClient.getFormattedTime()', 'timeClient.getFormattedTime()', { output: 'String' }),
      V('lib_ntp_epoch', 'timeClient.getEpochTime()', 'timeClient.getEpochTime()', { output: 'Number' }),
    ],
  },

  // ── Keyboard (HID) ─────────────────────────────────────────────────────────
  Keyboard: {
    colour: 70, emoji: '⌨️',
    blocks: [
      S('lib_keyboard_begin', 'Keyboard.begin()', 'Keyboard.begin()'),
      S('lib_keyboard_print', 'Keyboard.print', 'Keyboard.print({TEXT})', { inputs: [strI('TEXT', 'Hola', '')] }),
      S('lib_keyboard_press', 'Keyboard.press', 'Keyboard.press({KEY})', {
        fields: [dropF('KEY', [['Enter', 'KEY_RETURN'], ['Tab', 'KEY_TAB'], ['Esc', 'KEY_ESC'],
          ['Ctrl', 'KEY_LEFT_CTRL'], ['Alt', 'KEY_LEFT_ALT'], ['Shift', 'KEY_LEFT_SHIFT']], 'KEY_RETURN')],
      }),
      S('lib_keyboard_release_all', 'Keyboard.releaseAll()', 'Keyboard.releaseAll()'),
      S('lib_keyboard_end', 'Keyboard.end()', 'Keyboard.end()'),
    ],
  },

  // ── Mouse (HID) ────────────────────────────────────────────────────────────
  Mouse: {
    colour: 78, emoji: '🖱️',
    blocks: [
      S('lib_mouse_begin', 'Mouse.begin()', 'Mouse.begin()'),
      S('lib_mouse_move', 'Mouse.move', 'Mouse.move({X}, {Y}, 0)', {
        inputs: [numI('X', 10, 'x'), numI('Y', 0, 'y')],
      }),
      S('lib_mouse_click', 'Mouse.click', 'Mouse.click({BTN})', {
        fields: [dropF('BTN', [['izquierdo', 'MOUSE_LEFT'], ['derecho', 'MOUSE_RIGHT'],
          ['central', 'MOUSE_MIDDLE']], 'MOUSE_LEFT')],
      }),
      S('lib_mouse_end', 'Mouse.end()', 'Mouse.end()'),
    ],
  },

  // ── TMRpcm ─────────────────────────────────────────────────────────────────
  TMRpcm: {
    colour: 330, emoji: '🔈',
    blocks: [
      G('lib_tmrpcm_init', 'TMRpcm  audio', 'TMRpcm audio'),
      S('lib_tmrpcm_speaker', 'audio.speakerPin', 'audio.speakerPin = {PIN}', {
        fields: [numF('PIN', 9, '', 0, 53)],
      }),
      S('lib_tmrpcm_play', 'audio.play', 'audio.play({FILE})', { inputs: [strI('FILE', 'audio.wav', 'archivo')] }),
      S('lib_tmrpcm_volume', 'audio.setVolume', 'audio.setVolume({V})', { fields: [numF('V', 5, '', 0, 7)] }),
      S('lib_tmrpcm_stop', 'audio.stopPlayback()', 'audio.stopPlayback()'),
    ],
  },

  // ── talkie ─────────────────────────────────────────────────────────────────
  talkie: {
    colour: 320, emoji: '🗣️',
    blocks: [
      G('lib_talkie_init', 'Talkie  voz', 'Talkie voz'),
      S('lib_talkie_say', 'voz.say', 'voz.say({WORD})', {
        fields: [textF('WORD', 'spPAUSE1', 'palabra')],
        tooltip: 'Reproduce una palabra del vocabulario LPC (p. ej. spHELLO)',
      }),
    ],
  },

  // ── ArduinoJson ────────────────────────────────────────────────────────────
  ArduinoJson: {
    colour: 140, emoji: '🧾',
    blocks: [
      G('lib_json_doc', 'JsonDocument  doc', 'JsonDocument doc'),
      S('lib_json_set', 'doc[clave] =', 'doc[{KEY}] = {VALUE}', {
        inputs: [strI('KEY', 'temperatura', 'clave'), numI('VALUE', 0, 'valor')],
      }),
      V('lib_json_get', 'doc[clave]', 'doc[{KEY}]', { inputs: [strI('KEY', 'temperatura', '')] }),
      S('lib_json_serialize', 'serializeJson(doc, Serial)', 'serializeJson(doc, Serial)'),
      S('lib_json_deserialize', 'deserializeJson', 'deserializeJson(doc, {INPUT})', {
        inputs: [strI('INPUT', '{}', 'texto')],
      }),
    ],
  },

  // ── StreamUtils ────────────────────────────────────────────────────────────
  StreamUtils: {
    colour: 148, emoji: '🧵',
    blocks: [
      G('lib_streamutils_init', 'WriteBufferingStream  bufferedSerial', 'WriteBufferingStream bufferedSerial(Serial, {SIZE})', {
        fields: [numF('SIZE', 64, 'bytes', 8, 1024)],
      }),
      S('lib_streamutils_print', 'bufferedSerial.print', 'bufferedSerial.print({DATA})', {
        inputs: [strI('DATA', 'hola', '')],
      }),
      S('lib_streamutils_flush', 'bufferedSerial.flush()', 'bufferedSerial.flush()'),
    ],
  },

  // ── TaskScheduler ──────────────────────────────────────────────────────────
  TaskScheduler: {
    colour: 132, emoji: '🗓️',
    blocks: [
      G('lib_task_init', 'Scheduler  runner  +  Task', 'Scheduler runner;\nTask t1({INTERVAL}, TASK_FOREVER, &tarea1)', {
        fields: [numF('INTERVAL', 1000, 'cada ms')],
        tooltip: 'Declara el planificador y una tarea que llama a la función tarea1()',
      }),
      S('lib_task_setup', 'runner  preparar tareas', 'runner.init();\nrunner.addTask(t1);\nt1.enable()'),
      S('lib_task_execute', 'runner.execute()', 'runner.execute()', {
        tooltip: 'Llamar en cada loop() para que las tareas se ejecuten',
      }),
    ],
  },

  // ── Regexp ─────────────────────────────────────────────────────────────────
  Regexp: {
    colour: 155, emoji: '🔎',
    blocks: [
      G('lib_regexp_init', 'MatchState  ms', 'MatchState ms'),
      S('lib_regexp_target', 'ms.Target', 'ms.Target((char *) {TEXT})', {
        inputs: [strI('TEXT', 'texto 123', 'texto')],
      }),
      V('lib_regexp_match', 'ms.Match', 'ms.Match({PATTERN})', {
        inputs: [strI('PATTERN', '%d+', 'patrón')], output: 'Number',
      }),
    ],
  },
};

/** Bloques generados a partir de las especificaciones declarativas */
export const GENERATED_LIBRARY_BLOCKS = buildLibraryBlocksFromSpecs(LIBRARY_SPECS);
