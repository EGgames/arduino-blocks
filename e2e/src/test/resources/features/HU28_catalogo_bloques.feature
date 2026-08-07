# language: es
@HU-28 @bloques @v1.3
Característica: HU-28 Catálogo completo de bloques Arduino y C/C++
  Como usuario de Arduino Blocks IDE
  Quiero disponer de bloques para todo el lenguaje Arduino y C/C++
  Para escribir cualquier sketch sin salir del editor de bloques

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-28
  Escenario: La caja de herramientas agrupa el lenguaje en categorías
    Entonces la caja de herramientas tiene al menos 14 categorias

  @HU-28
  Esquema del escenario: Las categorías del lenguaje están disponibles
    Entonces la caja de herramientas muestra la categoria "<categoria>"

    Ejemplos:
      | categoria         |
      | Estructura        |
      | Pines Digitales   |
      | Pines Analógicos  |
      | Interrupciones    |
      | Tiempo            |
      | Serial            |
      | Control           |
      | Variables         |
      | Matemáticas       |
      | Bits              |
      | Lógica            |
      | Texto             |
      | Audio             |
      | Funciones         |

  @HU-28
  Esquema del escenario: Cada categoría ofrece bloques utilizables
    Cuando el usuario abre la categoria "<categoria>" de la caja de herramientas
    Entonces el desplegable muestra al menos 3 bloques

    Ejemplos:
      | categoria       |
      | Pines Digitales |
      | Serial          |
      | Control         |
      | Variables       |
      | Bits            |
      | Texto           |

  @HU-28
  Escenario: Los bloques de interrupciones generan código Arduino válido
    Cuando el usuario escribe el sketch:
      """
      volatile int pulsos = 0;
      void contar() {
        pulsos++;
      }
      void setup() {
        attachInterrupt(digitalPinToInterrupt(2), contar, RISING);
      }
      void loop() {
        noInterrupts();
        interrupts();
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_interrupts_toggle"

  @HU-28
  Escenario: Los operadores de bits se traducen a bloques
    Cuando el usuario escribe el sketch:
      """
      void setup() {
      }
      void loop() {
        int mascara = 1 << 3;
        int alto = highByte(1025);
        int b = bitRead(mascara, 3);
        bitSet(mascara, 0);
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_bitwise"
    Y el workspace contiene al menos un bloque de tipo "arduino_byte_part"
    Y el workspace contiene al menos un bloque de tipo "arduino_bit_read"
    Y el workspace contiene al menos un bloque de tipo "arduino_bit_set_clear"

  @HU-28
  Escenario: Las funciones de tiempo y aleatoriedad se traducen a bloques
    Cuando el usuario escribe el sketch:
      """
      void setup() {
        randomSeed(analogRead(A0));
      }
      void loop() {
        unsigned long t = micros();
        int dado = random(1, 7);
        int limite = min(dado, 6);
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_random_seed"
    Y el workspace contiene al menos un bloque de tipo "arduino_micros"
    Y el workspace contiene al menos un bloque de tipo "arduino_random"
    Y el workspace contiene al menos un bloque de tipo "arduino_min_max"

  @HU-28
  Escenario: Las llamadas no cubiertas por un bloque conservan sus argumentos
    Cuando el usuario escribe el sketch:
      """
      void setup() {
        lcd.begin(16, 2);
      }
      void loop() {
      }
      """
    Entonces la sincronizacion termina correctamente
    Y el workspace contiene al menos un bloque de tipo "arduino_function_call"
    Y el bloque "arduino_function_call" tiene el campo "ARGS" con valor "16, 2"
