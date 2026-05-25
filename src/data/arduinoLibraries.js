/**
 * Catálogo de librerías Arduino conocidas.
 * `name`    → nombre usado en el bloque (genera #include <name.h>)
 * `header`  → archivo .h si difiere del nombre (opcional)
 * `description` → texto breve para el usuario
 * `category`    → categoría de agrupación
 */
export const ARDUINO_LIBRARIES = [
  // ── Comunicación ──────────────────────────────────────────────────────
  { name: 'Wire',           description: 'Comunicación I2C',                    category: 'Comunicación' },
  { name: 'SPI',            description: 'Comunicación SPI',                    category: 'Comunicación' },
  { name: 'SoftwareSerial', description: 'Serial por software en pines digitales', category: 'Comunicación' },
  { name: 'OneWire',        description: 'Protocolo 1-Wire (para DS18B20, etc.)', category: 'Comunicación' },
  { name: 'IRremote',       description: 'Emisión y recepción por infrarrojo',   category: 'Comunicación' },
  { name: 'CAN',            description: 'Bus CAN (Arduino MKR CAN)',            category: 'Comunicación' },
  { name: 'RS485',          description: 'Comunicación RS-485 serie',            category: 'Comunicación' },

  // ── Sensores ──────────────────────────────────────────────────────────
  { name: 'DHT',              description: 'Temperatura/humedad DHT11 y DHT22', category: 'Sensores' },
  { name: 'NewPing',          description: 'Sensor ultrasónico HC-SR04',        category: 'Sensores' },
  { name: 'DallasTemperature', description: 'Temperatura DS18B20 (requiere OneWire)', category: 'Sensores' },
  { name: 'MPU6050',          description: 'Giroscopio y acelerómetro MPU-6050', category: 'Sensores' },
  { name: 'Adafruit_BMP280',  description: 'Presión atmosférica y temperatura BMP280', category: 'Sensores' },
  { name: 'Adafruit_BME280',  description: 'Presión, temperatura y humedad BME280', category: 'Sensores' },
  { name: 'Adafruit_ADXL345', description: 'Acelerómetro de 3 ejes ADXL345',   category: 'Sensores' },
  { name: 'CapacitiveSensor', description: 'Sensor táctil capacitivo',          category: 'Sensores' },
  { name: 'Sharp_IR',         description: 'Sensor de distancia infrarrojo Sharp', category: 'Sensores' },
  { name: 'MQ2',              description: 'Sensor de gas MQ-2',                category: 'Sensores' },

  // ── Displays ──────────────────────────────────────────────────────────
  { name: 'LiquidCrystal',     description: 'LCD paralelo HD44780 (RS, EN, D4-D7)', category: 'Displays' },
  { name: 'LiquidCrystal_I2C', description: 'LCD HD44780 via módulo I2C PCF8574',   category: 'Displays' },
  { name: 'Adafruit_SSD1306',  description: 'OLED 128×64 SSD1306 (I2C/SPI)',         category: 'Displays' },
  { name: 'Adafruit_GFX',      description: 'Librería base de gráficos 2D',          category: 'Displays' },
  { name: 'TM1637Display',     description: 'Display 7 segmentos con TM1637',        category: 'Displays' },
  { name: 'U8g2',              description: 'Displays monocromos universales',       category: 'Displays' },
  { name: 'Adafruit_ILI9341',  description: 'TFT a color ILI9341 (SPI)',             category: 'Displays' },
  { name: 'MAX7219',           description: 'Matriz de LEDs con controlador MAX7219', category: 'Displays' },

  // ── LEDs ──────────────────────────────────────────────────────────────
  { name: 'Adafruit_NeoPixel', description: 'Tiras LED WS2812B / NeoPixel',     category: 'LEDs' },
  { name: 'FastLED',           description: 'Tiras LED WS2812, APA102, etc.',    category: 'LEDs' },

  // ── Motores ───────────────────────────────────────────────────────────
  { name: 'Servo',        description: 'Control de servomotores RC (PWM)',        category: 'Motores' },
  { name: 'Stepper',      description: 'Motor paso a paso básico (4/2 pines)',    category: 'Motores' },
  { name: 'AccelStepper', description: 'Paso a paso con aceleración y velocidad', category: 'Motores' },
  { name: 'AFMotor',      description: 'Shield motores Adafruit v1 (L293D)',      category: 'Motores' },

  // ── Conectividad ──────────────────────────────────────────────────────
  { name: 'WiFi',        description: 'WiFi integrado (UNO R4, MKR)',             category: 'Conectividad' },
  { name: 'WiFiNINA',    description: 'WiFi para Nano 33 IoT / MKR 1010',         category: 'Conectividad' },
  { name: 'WiFiEspAT',   description: 'WiFi via módulo ESP8266 con firmware AT',  category: 'Conectividad' },
  { name: 'Ethernet',    description: 'Shield Ethernet W5100/W5500',              category: 'Conectividad' },
  { name: 'PubSubClient', description: 'Protocolo MQTT para IoT',                category: 'Conectividad' },
  { name: 'ArduinoHttpClient', description: 'Cliente HTTP/HTTPS',                category: 'Conectividad' },

  // ── Almacenamiento ────────────────────────────────────────────────────
  { name: 'EEPROM',       description: 'Memoria EEPROM interna del microcontrolador', category: 'Almacenamiento' },
  { name: 'SD',           description: 'Lectura/escritura en tarjetas SD/microSD',    category: 'Almacenamiento' },
  { name: 'Preferences',  description: 'Almacenamiento flash no volátil (ESP32)',      category: 'Almacenamiento' },
  { name: 'FlashStorage', description: 'EEPROM emulada en flash (SAMD)',               category: 'Almacenamiento' },

  // ── Identificación ────────────────────────────────────────────────────
  { name: 'MFRC522',              description: 'Lector RFID/NFC RC522 (SPI)',            category: 'Identificación' },
  { name: 'Adafruit_Fingerprint', description: 'Sensor de huellas dactilares (UART)',    category: 'Identificación' },

  // ── Tiempo ────────────────────────────────────────────────────────────
  { name: 'RTClib',    description: 'RTC DS1307, DS3231 (fecha y hora)',          category: 'Tiempo' },
  { name: 'TimeLib',   description: 'Manejo de fecha/hora en software',           category: 'Tiempo' },
  { name: 'NTPClient', description: 'Sincronización de hora por NTP (WiFi)',      category: 'Tiempo' },

  // ── Entrada ───────────────────────────────────────────────────────────
  { name: 'Keypad',   description: 'Teclado matricial (4×4, 4×3, etc.)',          category: 'Entrada' },
  { name: 'Encoder',  description: 'Encoder rotativo incremental',                category: 'Entrada' },
  { name: 'Bounce2',  description: 'Anti-rebote para botones y switches',         category: 'Entrada' },

  // ── HID ───────────────────────────────────────────────────────────────
  { name: 'Keyboard', description: 'Emulación de teclado USB (Leonardo/Micro)',   category: 'HID' },
  { name: 'Mouse',    description: 'Emulación de ratón USB (Leonardo/Micro)',     category: 'HID' },

  // ── Sonido ────────────────────────────────────────────────────────────
  { name: 'TMRpcm',  description: 'Reproducción de audio WAV desde SD',          category: 'Sonido' },
  { name: 'talkie',  description: 'Síntesis de voz (LPC speech)',                 category: 'Sonido' },

  // ── Utilidades ────────────────────────────────────────────────────────
  { name: 'ArduinoJson',  description: 'Parsear y generar JSON (v6/v7)',         category: 'Utilidades' },
  { name: 'StreamUtils',  description: 'Buffer y cache para streams serie',      category: 'Utilidades' },
  { name: 'TaskScheduler', description: 'Planificador de tareas cooperativo',    category: 'Utilidades' },
  { name: 'Regexp',        description: 'Expresiones regulares ligeras',         category: 'Utilidades' },
];

export const LIBRARY_CATEGORIES = [
  'Todas',
  'Comunicación',
  'Sensores',
  'Displays',
  'LEDs',
  'Motores',
  'Conectividad',
  'Almacenamiento',
  'Identificación',
  'Tiempo',
  'Entrada',
  'HID',
  'Sonido',
  'Utilidades',
];
