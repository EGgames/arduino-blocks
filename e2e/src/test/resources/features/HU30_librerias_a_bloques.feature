# language: es
@HU-30 @librerias @v1.3
Característica: HU-30 Todas las librerías se traducen a bloques
  Como usuario de Arduino Blocks IDE
  Quiero que cualquier librería del catálogo aporte sus propios bloques
  Para programar hardware sin escribir código a mano

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-30
  Escenario: Al incluir una librería aparece su categoría de bloques
    Cuando el usuario agrega la libreria "Servo"
    Entonces la libreria "Servo" esta incluida en el proyecto
    Y la caja de herramientas muestra la categoria "Servo"

  @HU-30
  Esquema del escenario: Cada librería del catálogo aporta sus bloques
    Cuando el usuario escribe el sketch:
      """
      #include <<lib>.h>
      void setup() {
      }
      void loop() {
      }
      """
    Entonces la caja de herramientas muestra la categoria "<lib>"

    Ejemplos:
      | lib               |
      | SPI               |
      | OneWire           |
      | IRremote          |
      | FastLED           |
      | AccelStepper      |
      | ArduinoJson       |
      | MFRC522           |
      | SD                |
      | NTPClient         |
      | Keyboard          |
      | Adafruit_BMP280   |
      | TM1637Display     |
      | U8g2              |
      | PubSubClient      |
      | Sharp_IR          |
      | TaskScheduler     |

  @HU-30
  Escenario: Una librería desconocida también obtiene bloques genéricos
    Cuando el usuario escribe el sketch:
      """
      #include <MiLibreriaPropia.h>
      void setup() {
      }
      void loop() {
      }
      """
    Entonces la caja de herramientas muestra la categoria "MiLibreriaPropia"

  @HU-30
  Escenario: Los bloques de una librería incluida se pueden desplegar
    Cuando el usuario escribe el sketch:
      """
      #include <Servo.h>
      void setup() {
      }
      void loop() {
      }
      """
    Y el usuario abre la categoria "Servo" de la caja de herramientas
    Entonces el desplegable muestra al menos 3 bloques

  @HU-30
  Escenario: Sin includes no se muestran categorías de librería
    Entonces la caja de herramientas no muestra la categoria "FastLED"

  @HU-30
  Escenario: El código de una librería se convierte en bloques sin perder argumentos
    Cuando el usuario escribe el sketch:
      """
      #include <Servo.h>
      Servo myServo;
      void setup() {
        myServo.attach(9);
      }
      void loop() {
        myServo.write(90);
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_include"
    Y el bloque "arduino_function_call" tiene el campo "ARGS" con valor "9"
