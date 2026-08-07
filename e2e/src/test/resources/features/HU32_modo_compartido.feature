# language: es
@HU-32 @modo @v1.3
Característica: HU-32 El modo Niño y el modo Avanzado comparten el mismo programa
  Como docente
  Quiero que al cambiar de modo solo cambie la presentación y no el proyecto
  Para poder mostrar el mismo programa a alumnos de distinto nivel

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-32
  Escenario: El modo Niño ofrece guardar, nuevo y abrir
    Cuando el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Niño"
    Y el usuario cierra el dialogo de configuracion
    Entonces el boton "Guardar" es visible
    Y el boton "Nuevo" es visible
    Y el boton "Abrir" es visible

  @HU-32
  Escenario: Un programa de modo Avanzado se ve como programa de modo Niño
    Cuando el usuario escribe el sketch:
      """
      int ledPin = 9;
      void setup() {
        pinMode(ledPin, OUTPUT);
      }
      void loop() {
        digitalWrite(ledPin, HIGH);
        delay(500);
      }
      """
    Entonces el workspace contiene al menos un bloque de tipo "arduino_digital_write"
    Cuando el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Niño"
    Y el usuario cierra el dialogo de configuracion
    Entonces el workspace contiene al menos un bloque de tipo "kids_digital_write"
    Y el workspace contiene al menos un bloque de tipo "kids_pin_mode"
    Y el bloque "kids_digital_write" tiene el campo "PIN" con valor "ledPin"

  @HU-32
  Escenario: Volver al modo Avanzado recupera el mismo código
    Cuando el usuario escribe el sketch:
      """
      void setup() {
        pinMode(13, OUTPUT);
      }
      void loop() {
        digitalWrite(13, HIGH);
        delay(1000);
        digitalWrite(13, LOW);
        delay(1000);
      }
      """
    Y el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Niño"
    Y el usuario cierra el dialogo de configuracion
    Y el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Avanzado"
    Y el usuario cierra el dialogo de configuracion
    Entonces el codigo generado contiene "pinMode(13, OUTPUT);"
    Y el codigo generado contiene "digitalWrite(13, HIGH);"
    Y el codigo generado contiene "digitalWrite(13, LOW);"
    Y el codigo generado contiene "delay(1000);"

  @HU-32
  Escenario: Los bloques sin equivalente infantil se conservan al cambiar de modo
    Cuando el usuario escribe el sketch:
      """
      void setup() {
        Serial.begin(115200);
      }
      void loop() {
        int b = bitRead(flags, 3);
      }
      """
    Y el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Niño"
    Y el usuario cierra el dialogo de configuracion
    Entonces el workspace contiene al menos un bloque de tipo "arduino_serial_begin"
    Y el workspace contiene al menos un bloque de tipo "arduino_bit_read"
