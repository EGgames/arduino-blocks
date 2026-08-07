# language: es
@HU-29 @variables @v1.3
Característica: HU-29 Variables con nombre en cualquier hueco de valor
  Como usuario de Arduino Blocks IDE
  Quiero poner nombre a mis variables y usarlas allí donde va un valor
  Para no tener que repetir números mágicos en pines, límites y parámetros

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-29
  Escenario: Una variable global con nombre se puede usar como número de pin
    Cuando el usuario escribe el sketch:
      """
      int ledPin = 9;
      void setup() {
        pinMode(ledPin, OUTPUT);
      }
      void loop() {
        digitalWrite(ledPin, HIGH);
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_global_variable_declare"
    Y el bloque "arduino_global_variable_declare" tiene el campo "NAME" con valor "ledPin"
    Y el bloque "arduino_pin_mode" tiene conectado un bloque "arduino_variable_get" en la entrada "PIN"
    Y el bloque "arduino_digital_write" tiene conectado un bloque "arduino_variable_get" en la entrada "PIN"

  @HU-29
  Escenario: El estado HIGH/LOW también es un valor enchufable
    Cuando el usuario escribe el sketch:
      """
      void setup() {
      }
      void loop() {
        digitalWrite(13, LOW);
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el bloque "arduino_digital_write" tiene conectado un bloque "arduino_digital_state" en la entrada "VALUE"
    Y el bloque "arduino_digital_state" tiene el campo "STATE" con valor "LOW"

  @HU-29
  Escenario: El pin analógico se representa con su propio bloque de valor
    Cuando el usuario escribe el sketch:
      """
      void setup() {
      }
      void loop() {
        int valor = analogRead(A2);
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el bloque "arduino_analog_read" tiene conectado un bloque "arduino_analog_pin" en la entrada "PIN"
    Y el bloque "arduino_analog_pin" tiene el campo "PIN" con valor "A2"

  @HU-29
  Escenario: Una variable puede definir el límite de un bucle for
    Cuando el usuario escribe el sketch:
      """
      int total = 5;
      void setup() {
      }
      void loop() {
        for (int i = 0; i <= total; i++) {
          delay(10);
        }
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el bloque "arduino_for" tiene conectado un bloque "arduino_variable_get" en la entrada "TO"

  @HU-29
  Escenario: Una constante de preprocesador sirve como pin
    Cuando el usuario escribe el sketch:
      """
      #define LED_PIN 13
      void setup() {
        pinMode(LED_PIN, OUTPUT);
      }
      void loop() {
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_define"
    Y el bloque "arduino_pin_mode" tiene conectado un bloque "arduino_variable_get" en la entrada "PIN"

  @HU-29
  Escenario: Las variables se pueden leer y asignar por nombre
    Cuando el usuario escribe el sketch:
      """
      void setup() {
      }
      void loop() {
        int contador = 0;
        contador = contador + 1;
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_variable_declare"
    Y el workspace contiene al menos un bloque de tipo "arduino_variable_set"
    Y el workspace contiene al menos un bloque de tipo "arduino_variable_get"
    Y el bloque "arduino_variable_declare" tiene el campo "NAME" con valor "contador"
