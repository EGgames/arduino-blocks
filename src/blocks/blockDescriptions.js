// ──────────────────────────────────────────────────────────
// Descripciones educativas de cada bloque Arduino
// Cada entrada: { title, description, code, tip? }
// ──────────────────────────────────────────────────────────

export const BLOCK_DESCRIPTIONS = {

  // ── Estructura principal ──────────────────────────────────
  arduino_setup_loop: {
    title: '⚙️  Setup / Loop',
    description:
      'La estructura base de todo programa Arduino. El código en setup() se ejecuta UNA sola vez al encender la placa. El código en loop() se repite continuamente para siempre.',
    code: 'void setup() { /* inicialización */ }\nvoid loop()  { /* lógica principal */ }',
    tip: 'Todo sketch necesita este bloque. Configura pines en setup() y lee/escribe en loop().',
  },

  // ── Pines digitales ───────────────────────────────────────
  arduino_pin_mode: {
    title: '📌  pinMode',
    description:
      'Configura un pin como ENTRADA (INPUT / INPUT_PULLUP) o SALIDA (OUTPUT). Llamar siempre en setup().',
    code: 'pinMode(13, OUTPUT);',
    tip: 'INPUT_PULLUP activa la resistencia interna de pull-up: el pin lee HIGH cuando no está conectado a nada.',
  },

  arduino_digital_write: {
    title: '💡  digitalWrite',
    description:
      'Escribe HIGH (5 V) o LOW (0 V) en un pin digital configurado como OUTPUT. Ideal para encender/apagar LEDs, relés, etc.',
    code: 'digitalWrite(13, HIGH); // enciende\ndigitalWrite(13, LOW);  // apaga',
    tip: 'El LED integrado de la placa está en el pin 13.',
  },

  arduino_digital_read: {
    title: '🔍  digitalRead',
    description:
      'Lee el estado de un pin digital: devuelve HIGH (1) si hay tensión o LOW (0) si no la hay.',
    code: 'int estado = digitalRead(2); // HIGH o LOW',
    tip: 'Configura el pin como INPUT o INPUT_PULLUP con pinMode() antes de leer.',
  },

  // ── Pines analógicos ──────────────────────────────────────
  arduino_analog_write: {
    title: '〰️  analogWrite (PWM)',
    description:
      'Genera una señal PWM en un pin (~). El valor va de 0 (siempre LOW) a 255 (siempre HIGH). Sirve para controlar brillo, velocidad, etc.',
    code: 'analogWrite(9, 128); // 50 % de potencia',
    tip: 'Solo funciona en pines marcados con ~ (3, 5, 6, 9, 10, 11 en Arduino UNO).',
  },

  arduino_analog_read: {
    title: '📊  analogRead',
    description:
      'Lee un valor analógico de un pin A0–A5. Devuelve un número de 0 a 1023, proporcional al voltaje (0–5 V).',
    code: 'int valor = analogRead(A0); // 0-1023',
    tip: '512 ≈ 2.5 V. Divide entre 1023.0 y multiplica por 5 para obtener voltios.',
  },

  // ── Tiempo ────────────────────────────────────────────────
  arduino_delay: {
    title: '⏱️  delay',
    description:
      'Detiene la ejecución del programa por la cantidad de milisegundos indicada. 1000 ms = 1 segundo.',
    code: 'delay(1000); // pausa 1 segundo',
    tip: 'Mientras delay() espera, el Arduino no puede hacer nada más. Para tareas sin bloqueo usa millis().',
  },

  arduino_delay_microseconds: {
    title: '⏱️  delayMicroseconds',
    description:
      'Pausa la ejecución por la cantidad de microsegundos indicada. Útil para protocolos de comunicación precisos.',
    code: 'delayMicroseconds(500); // pausa 0.5 ms',
    tip: '1 milisegundo = 1000 microsegundos.',
  },

  arduino_millis: {
    title: '🕐  millis()',
    description:
      'Devuelve el tiempo en milisegundos transcurrido desde que la placa se encendió. Permite temporizar sin bloquear el loop.',
    code: 'unsigned long t = millis(); // ms desde inicio',
    tip: 'Guarda el valor inicial en una variable y compara: if (millis() - inicio >= 1000) { ... }',
  },

  // ── Serial ────────────────────────────────────────────────
  arduino_serial_begin: {
    title: '📡  Serial.begin',
    description:
      'Inicializa la comunicación serial con la velocidad indicada (bauds). Llamar en setup(). Permite enviar datos al Monitor Serial del IDE.',
    code: 'Serial.begin(9600);',
    tip: 'El Monitor Serial de Arduino IDE debe estar configurado con la misma velocidad.',
  },

  arduino_serial_println: {
    title: '🖨️  Serial.println',
    description:
      'Envía un valor al Monitor Serial seguido de un salto de línea. Ideal para depurar y ver valores de sensores.',
    code: 'Serial.println(valor); // imprime + nueva línea',
    tip: 'Abre el Monitor Serial en Arduino IDE con Ctrl+Shift+M.',
  },

  arduino_serial_print: {
    title: '🖨️  Serial.print',
    description:
      'Envía un valor al Monitor Serial SIN salto de línea. Útil para imprimir varios valores en la misma línea.',
    code: 'Serial.print("Temp: "); Serial.println(t);',
  },

  // ── Variables ─────────────────────────────────────────────
  arduino_variable_declare: {
    title: '📦  Declarar variable',
    description:
      'Crea una variable local con un nombre, tipo y valor inicial. int para enteros, float para decimales, bool para verdadero/falso, String para texto.',
    code: 'int contador = 0;\nfloat temperatura = 23.5;',
    tip: 'El nombre no puede tener espacios ni empezar con número.',
  },

  arduino_variable_get: {
    title: '📤  Leer variable',
    description:
      'Obtiene el valor actual de una variable. Úsalo en cualquier lugar donde necesites ese valor.',
    code: '// en una condición: if (contador > 10)',
  },

  arduino_variable_set: {
    title: '📥  Asignar variable',
    description:
      'Cambia el valor de una variable ya declarada.',
    code: 'contador = contador + 1;\ntemperatura = analogRead(A0) * 0.48;',
    tip: 'El nombre debe coincidir exactamente con el de la declaración.',
  },

  arduino_global_variable_declare: {
    title: '🌍  Variable global',
    description:
      'Declara una variable accesible desde cualquier función del programa. Úsala flotando fuera del bloque Setup/Loop.',
    code: 'int ledPin = 13; // global, al inicio del sketch',
    tip: 'Arrastra este bloque fuera del Setup/Loop para que sea global.',
  },

  arduino_const_define: {
    title: '🔒  Constante',
    description:
      'Define un valor constante que no cambia durante la ejecución. Más seguro que una variable para valores fijos.',
    code: 'const int LED_PIN = 13;\nconst float PI = 3.14159;',
  },

  // ── Condicionales ─────────────────────────────────────────
  arduino_if_simple: {
    title: '❓  Si (if)',
    description:
      'Ejecuta los bloques internos solo si la condición es verdadera. Si es falsa, los omite.',
    code: 'if (temperatura > 30) {\n  digitalWrite(13, HIGH);\n}',
  },

  arduino_if: {
    title: '❓  Si / Si no (if / else)',
    description:
      'Si la condición es verdadera ejecuta el primer bloque; si es falsa ejecuta el bloque "si no".',
    code: 'if (boton == HIGH) {\n  encender();\n} else {\n  apagar();\n}',
  },

  arduino_compare: {
    title: '⚖️  Comparación',
    description:
      'Compara dos valores con ==, !=, <, >, <=, >=. El resultado es true o false y se usa con condicionales.',
    code: 'sensor > 500   // true si sensor es mayor que 500\nsensor == 0    // true si sensor es exactamente 0',
  },

  arduino_logic: {
    title: '🔗  Lógica AND / OR',
    description:
      'Combina dos condiciones. AND (&&): ambas deben ser verdaderas. OR (||): al menos una debe ser verdadera.',
    code: 'if (a > 0 && b < 10) { ... }  // ambas\nif (x || y) { ... }           // alguna',
  },

  arduino_not: {
    title: '🔄  NOT (negación)',
    description:
      'Invierte una condición: convierte true en false y viceversa.',
    code: 'if (!digitalRead(2)) { ... } // si el pin NO está en HIGH',
  },

  // ── Bucles ────────────────────────────────────────────────
  arduino_for: {
    title: '🔁  Bucle for',
    description:
      'Repite un bloque de código un número fijo de veces usando un contador.',
    code: 'for (int i = 0; i < 10; i++) {\n  digitalWrite(13, HIGH);\n  delay(100);\n}',
    tip: 'El contador i empieza en "de", llega hasta "hasta"-1 y avanza de "paso" en "paso".',
  },

  arduino_while: {
    title: '🔁  Bucle while',
    description:
      'Repite el bloque de código MIENTRAS la condición sea verdadera. Si empieza falsa, no se ejecuta.',
    code: 'while (digitalRead(2) == LOW) {\n  delay(10);\n}',
  },

  arduino_do_while: {
    title: '🔁  Bucle do…while',
    description:
      'Ejecuta el bloque de código al menos UNA vez y luego sigue repitiéndolo mientras la condición sea verdadera.',
    code: 'do {\n  leerSensor();\n} while (!datoValido);',
  },

  arduino_switch_case: {
    title: '🔀  Switch / Case',
    description:
      'Evalúa una expresión y ejecuta el bloque correspondiente a su valor. Más legible que múltiples if/else.',
    code: 'switch (modo) {\n  case 1: encender(); break;\n  case 2: apagar();   break;\n  default: esperar();\n}',
  },

  // ── Funciones ─────────────────────────────────────────────
  arduino_function_define: {
    title: '🛠️  Definir función',
    description:
      'Crea una función reutilizable con nombre propio. Agrupa código que se repite o que tiene una tarea específica.',
    code: 'void parpadear() {\n  digitalWrite(13, HIGH); delay(500);\n  digitalWrite(13, LOW);  delay(500);\n}',
    tip: 'Escribe los parámetros en el campo PARAMS separados por coma: int vel, float amp',
  },

  arduino_function_call: {
    title: '📞  Llamar función',
    description:
      'Ejecuta una función ya definida, pasándole los argumentos necesarios.',
    code: 'parpadear();\nmoverMotor(velocidad, 200);',
  },

  arduino_function_call_expr: {
    title: '📞  Llamar función (con resultado)',
    description:
      'Llama a una función y usa el valor que retorna como parte de una expresión.',
    code: 'int t = leerTemperatura();\nif (calcularMedia() > 50) { ... }',
  },

  arduino_return: {
    title: '↩️  return (con valor)',
    description:
      'Sale de la función actual devolviendo un valor al código que la llamó.',
    code: 'int sumar(int a, int b) {\n  return a + b;\n}',
  },

  arduino_return_void: {
    title: '↩️  return (sin valor)',
    description:
      'Sale inmediatamente de una función void, sin devolver ningún valor.',
    code: 'void verificar() {\n  if (error) return;\n  procesar();\n}',
  },

  // ── Matemáticas ───────────────────────────────────────────
  arduino_map: {
    title: '📐  map()',
    description:
      'Transforma un número de un rango a otro. Muy útil para convertir lecturas analógicas (0-1023) a rangos útiles.',
    code: '// Sensor (0-1023) → ángulo servo (0-180)\nint angulo = map(analogRead(A0), 0, 1023, 0, 180);',
  },

  arduino_constrain: {
    title: '🛑  constrain()',
    description:
      'Limita un valor para que nunca salga de un rango mínimo/máximo. Evita valores fuera de rango.',
    code: 'int vel = constrain(velocidad, 0, 255);\n// vel nunca será < 0 ni > 255',
  },

  arduino_modulo: {
    title: '➗  % (módulo / resto)',
    description:
      'Calcula el resto de dividir A entre B. Sirve para saber si un número es par/impar, o para que un contador "dé la vuelta" al llegar a un límite.',
    code: 'int resto = 7 % 2; // resto = 1\nif (i % 2 == 0) { /* i es par */ }',
    tip: 'i % tamaño hace que i vuelva a 0 al llegar a "tamaño" (animaciones, ciclos, etc.).',
  },

  arduino_bitwise: {
    title: '🔢  Operadores bit a bit',
    description:
      'Trabaja con los bits individuales de un número: AND (&), OR (|), XOR (^) y desplazamientos (<<, >>). Muy usado para registros, máscaras de bits y banderas.',
    code: 'int mascara = valor & 0x0F;\nint doble   = valor << 1; // multiplica por 2\nint mitad   = valor >> 1; // divide por 2',
    tip: '<< n multiplica por 2^n, >> n divide por 2^n (para enteros).',
  },

  arduino_bitwise_not: {
    title: '🔁  ~ (NOT bit a bit)',
    description:
      'Invierte cada bit de un número: los 0 se vuelven 1 y los 1 se vuelven 0 (complemento a uno).',
    code: 'int inverso = ~valor;',
    tip: 'No confundir con el NOT lógico (!): ~5 no es lo mismo que !5.',
  },

  // ── Audio ─────────────────────────────────────────────────
  arduino_tone: {
    title: '🔊  tone()',
    description:
      'Genera un tono de la frecuencia indicada en un pin con un buzzer o altavoz.',
    code: 'tone(8, 440); // La → 440 Hz en pin 8',
    tip: 'La escala musical: Do=262, Re=294, Mi=330, Fa=349, Sol=392, La=440, Si=494 Hz.',
  },

  arduino_no_tone: {
    title: '🔇  noTone()',
    description:
      'Detiene el tono que se está generando en el pin indicado.',
    code: 'noTone(8);',
  },

  // ── Librerías y estructuras ────────────────────────────────
  arduino_include: {
    title: '📚  #include',
    description:
      'Incluye una librería externa que agrega nuevas funciones. Debe estar fuera del bloque Setup/Loop.',
    code: '#include <Servo.h>\n#include <Wire.h>',
    tip: 'Arrastra este bloque fuera del Setup/Loop (área libre del workspace).',
  },

  arduino_comment: {
    title: '💬  Comentario',
    description:
      'Agrega una nota explicativa al código. Los comentarios son ignorados por el compilador, sirven para documentar.',
    code: '// Este bloque enciende el LED del pin 13',
  },

  // ── Arrays ────────────────────────────────────────────────
  arduino_array_declare: {
    title: '🗂️  Declarar array',
    description:
      'Crea un array (lista de valores del mismo tipo). Útil para almacenar múltiples lecturas o secuencias.',
    code: 'int miArray[10]; // array de 10 enteros',
    tip: 'Los índices van de 0 a (tamaño - 1). Un array de 10 elementos tiene índices 0…9.',
  },

  arduino_array_get: {
    title: '📤  Leer elemento de array',
    description:
      'Obtiene el valor guardado en la posición indicada del array.',
    code: 'int primero = miArray[0];\nint ultimo  = miArray[9];',
  },

  arduino_array_set: {
    title: '📥  Escribir en array',
    description:
      'Asigna un valor en la posición indicada del array.',
    code: 'miArray[0] = 42;\nmiArray[i] = analogRead(A0);',
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Descripciones para el MODO NIÑO — lenguaje simple, emojis, ejemplos cotidianos
// Campos extra: emoji (grande), example (qué hacer con el bloque)
// ──────────────────────────────────────────────────────────────────────────────
export const KIDS_BLOCK_DESCRIPTIONS = {

  kids_setup_loop: {
    emoji: '⚙️',
    title: '¡El bloque más importante!',
    description: 'Todo programa empieza aquí. Lo que pongas en "Preparar" ocurre UNA vez al encender el Arduino. Lo que pongas en "Repetir siempre" se repite sin parar, ¡como un corazón latiendo!',
    example: 'Pon la configuración de pines en "Preparar" y haz que tu LED parpadee en "Repetir siempre".',
    tip: '💡 Sin este bloque el Arduino no sabe qué hacer.',
  },

  kids_pin_mode: {
    emoji: '🔌',
    title: '¿Entrada o salida?',
    description: 'Le dices al Arduino si un pin va a ENVIAR señales (SALIDA, como un LED) o RECIBIR señales (ENTRADA, como un botón).',
    example: 'Si quieres encender un LED en el pin 13, ponlo como SALIDA.',
    tip: '💡 Usa siempre este bloque en "Preparar" antes de encender o leer algo.',
  },

  kids_digital_write: {
    emoji: '💡',
    title: '¡Enciende o apaga!',
    description: 'Con este bloque enciendes o apagas cualquier cosa conectada a un pin: un LED, un zumbador, un motor... ¡Lo que imagines!',
    example: 'Pin 13 → ENCENDIDO enciende el LED de la placa. Pin 13 → APAGADO lo apaga.',
    tip: '💡 El pin 13 ya tiene un LED incluido en la placa Arduino.',
  },

  kids_digital_read: {
    emoji: '👁️',
    title: '¡Lee un botón!',
    description: 'Pregunta al Arduino si un pin tiene señal o no. Perfecto para saber si alguien apretó un botón.',
    example: 'Conecta un botón al pin 2 y usa este bloque para saber si está apretado.',
    tip: '💡 Devuelve 1 (apretado) o 0 (suelto).',
  },

  kids_analog_write: {
    emoji: '〰️',
    title: '¡Controla el brillo!',
    description: 'Envía un valor entre 0 y 255 para controlar cuánta energía va al pin. ¡Puedes hacer que un LED brille suavemente!',
    example: '0 = apagado, 128 = mitad de brillo, 255 = brillo máximo.',
    tip: '💡 Solo funciona en los pines marcados con ~ (tilde): 3, 5, 6, 9, 10, 11.',
  },

  kids_analog_read: {
    emoji: '📊',
    title: '¡Lee un sensor!',
    description: 'Lee cuánta señal llega por un pin analógico. Devuelve un número del 0 al 1023. Sirve para sensores de luz, temperatura, sonido...',
    example: 'Conecta un potenciómetro al pin A0 y mira cómo cambia el número al girarlo.',
    tip: '💡 Cuanto más cerca de 1023, más voltaje llega al pin.',
  },

  kids_delay: {
    emoji: '⏸️',
    title: '¡Espera un momento!',
    description: 'Hace una pausa en el programa. El número que pones son milisegundos. ¡1000 milisegundos es exactamente 1 segundo!',
    example: 'Esperar 1000 → pausa de 1 segundo. Esperar 500 → medio segundo.',
    tip: '💡 Usa este bloque entre ENCENDIDO y APAGADO para hacer parpadear un LED.',
  },

  kids_millis: {
    emoji: '⏱️',
    title: '¿Cuánto tiempo pasó?',
    description: 'Te dice cuántos milisegundos han pasado desde que encendiste el Arduino. ¡Puede usarse como cronómetro!',
    example: 'Si millis() devuelve 3000, significa que el Arduino lleva 3 segundos encendido.',
    tip: '💡 Útil para hacer cosas cada cierto tiempo sin pausar el programa.',
  },

  kids_serial_begin: {
    emoji: '📡',
    title: '¡Activar el chat con la computadora!',
    description: 'Enciende la comunicación entre el Arduino y tu computadora. Úsalo siempre en "Preparar" si quieres ver mensajes en pantalla.',
    example: 'Ponlo en "Preparar" y luego usa "Mostrar mensaje" para ver texto en la computadora.',
    tip: '💡 Abre el Monitor Serial en Arduino IDE para ver los mensajes.',
  },

  kids_serial_println: {
    emoji: '🖨️',
    title: '¡Muestra un mensaje!',
    description: 'Envía un texto o número a la pantalla de la computadora. ¡Perfecto para saber qué está pasando en tu programa!',
    example: '"Hola mundo" → aparece en la pantalla. También puedes mostrar el valor de un sensor.',
    tip: '💡 Cada mensaje aparece en una línea nueva.',
  },

  kids_serial_print: {
    emoji: '📝',
    title: '¡Muestra texto sin saltar!',
    description: 'Igual que "Mostrar mensaje", pero el siguiente texto aparece justo al lado, en la misma línea.',
    example: 'Útil para mostrar: "Temperatura: " + número + " °C" todo en una sola línea.',
    tip: '💡 Combínalo con "Mostrar mensaje" para un resultado más ordenado.',
  },

  kids_if_simple: {
    emoji: '❓',
    title: '¡Solo si se cumple!',
    description: 'Ejecuta acciones únicamente si una condición es verdadera. Si la condición no se cumple, ¡el bloque se salta!',
    example: 'Si el botón está apretado → enciende el LED. Si no, no hace nada.',
    tip: '💡 Usa un bloque "Comparar" dentro de la condición.',
  },

  kids_if: {
    emoji: '🔀',
    title: '¡Si sí... si no!',
    description: 'Si la condición se cumple hace una cosa, y si NO se cumple hace otra diferente.',
    example: 'Si el sensor detecta luz → enciende LED. Si no hay luz → apaga LED.',
    tip: '💡 Siempre se ejecuta una de las dos opciones, ¡nunca las dos!',
  },

  kids_for: {
    emoji: '🔁',
    title: '¡Repite contando!',
    description: 'Repite acciones un número exacto de veces mientras cuenta. La variable va aumentando en cada repetición.',
    example: 'Repetir con i de 0 hasta 5 → hace la acción 5 veces contando 0, 1, 2, 3, 4.',
    tip: '💡 Ideal para hacer parpadear un LED un número exacto de veces.',
  },

  kids_compare: {
    emoji: '⚖️',
    title: '¡Compara dos cosas!',
    description: 'Compara dos números y dice si es verdadero o falso. Lo usas dentro de un bloque "Si" o "Mientras".',
    example: 'Si sensor = 1023 → el sensor detecta el máximo de luz.',
    tip: '💡 Usa "= igual" para saber si dos valores son exactamente iguales.',
  },

  kids_tone: {
    emoji: '🎵',
    title: '¡Haz música!',
    description: 'Hace sonar un zumbador o pequeño altavoz en la frecuencia que elijas. ¡Puedes tocar melodías!',
    example: '262 Hz = Do, 330 Hz = Mi, 392 Hz = Sol, 440 Hz = La.',
    tip: '💡 Conecta un zumbador (buzzer) al pin elegido y a GND.',
  },

  kids_no_tone: {
    emoji: '🔇',
    title: '¡Silencio!',
    description: 'Para el sonido que está produciendo el pin indicado.',
    example: 'Úsalo después de kids_tone para detener la nota musical.',
    tip: '💡 Sin este bloque el sonido continúa para siempre.',
  },

  // ── Nuevos bloques completos del modo Niño ────────────────────────────────
  kids_comment: {
    emoji: '💬',
    title: 'Nota / Comentario',
    description: 'Escribe un mensaje en el código para recordar qué hace esa parte. ¡El Arduino no lo lee!',
    example: '// Este LED parpadea cada segundo',
    tip: '💡 Los comentarios ayudan a otros a entender tu programa (¡y a ti mismo más tarde!).',
  },
  kids_define: {
    emoji: '🏷️',
    title: 'Nombrar un número',
    description: 'Le pone un nombre corto a un número para no tener que recordarlo. Arrástralo fuera de Preparar y Repetir.',
    example: 'Nombrar LED_PIN como 13 → después escribes LED_PIN en vez de 13.',
    tip: '💡 Los nombres suelen escribirse EN_MAYÚSCULAS para que se vean diferentes.',
  },
  kids_include: {
    emoji: '📚',
    title: 'Incluir librería',
    description: 'Agrega un paquete extra de funciones que alguien más programó. Arrástralo fuera de Preparar y Repetir.',
    example: 'Librería Wire → permite hablar con sensores especiales.',
    tip: '💡 Cada librería necesita incluirse solo una vez y va al inicio del programa.',
  },
  kids_map: {
    emoji: '📐',
    title: 'Transformar rango',
    description: 'Convierte un número de un rango a otro. Muy útil para sensores y LEDs.',
    example: 'Sensor 0-1023 → brillo LED 0-255',
    tip: '💡 Si el joystick da valores de 0 a 1023, usa map para convertirlos a 0-255 de brillo.',
  },
  kids_constrain: {
    emoji: '📏',
    title: 'Limitar valor',
    description: 'Se asegura de que un número nunca sea más pequeño que el mínimo ni más grande que el máximo.',
    example: 'Limitar velocidad entre 0 y 255',
    tip: '💡 Evita que tu motor gire demasiado rápido o que el brillo se salga del rango.',
  },
  kids_delay_micros: {
    emoji: '⏱️',
    title: 'Esperar microsegundos',
    description: 'Espera una cantidad muy pequeña de tiempo. 1000 microsegundos = 1 milisegundo.',
    example: 'Esperar 500 µs → medio milisegundo de pausa.',
    tip: '💡 Úsalo cuando necesitas tiempos muy precisos, como para comunicarte con sensores ultrasónicos.',
  },
  kids_micros: {
    emoji: '🕐',
    title: 'Tiempo exacto (µs)',
    description: 'Dice cuántos microsegundos han pasado desde que encendiste la placa. Muy preciso.',
    example: 'inicio = micros() → luego mides cuánto tardó algo.',
    tip: '💡 Se reinicia cada ~70 minutos. Para medir tiempos largos usa millis().',
  },
  kids_serial_available: {
    emoji: '📬',
    title: '¿Hay mensajes?',
    description: 'Dice cuántos bytes están esperando ser leídos desde la computadora. Si es 0, no hay nada.',
    example: 'si (¿Hay mensajes? > 0) → leer el carácter',
    tip: '💡 Siempre verifica si hay mensajes antes de intentar leerlos.',
  },
  kids_serial_read: {
    emoji: '📨',
    title: 'Leer carácter',
    description: 'Lee el siguiente byte que llegó desde la computadora por el cable USB.',
    example: 'char letra = Leer carácter → guarda la letra que llegó.',
    tip: '💡 Si no hay nada que leer devuelve -1. ¡Comprueba primero con "¿Hay mensajes?"!',
  },
  kids_while: {
    emoji: '🔄',
    title: 'Repetir mientras',
    description: 'Repite un grupo de acciones una y otra vez, mientras la condición sea verdadera.',
    example: 'Repetir mientras temperatura > 30 → encender ventilador.',
    tip: '💡 Si la condición nunca se vuelve falsa el bucle no para. ¡Asegúrate de que cambie!',
  },
  kids_do_while: {
    emoji: '🔃',
    title: 'Hacer primero, repetir si...',
    description: 'Hace las acciones al menos UNA VEZ y luego las repite si la condición sigue siendo verdadera.',
    example: 'Hacer: pedir contraseña. Repetir si es incorrecta.',
    tip: '💡 La diferencia con "mientras" es que aquí las acciones ocurren siempre al menos una vez.',
  },
  kids_switch: {
    emoji: '🔀',
    title: 'Según el valor',
    description: 'Elige qué hacer dependiendo del valor exacto de una variable. Más ordenado que muchos "si/sino".',
    example: 'Según tecla: cuando sea "A" → encender LED rojo; cuando sea "B" → LED verde.',
    tip: '💡 Usa "en cualquier otro caso" para cuando el valor no coincide con ninguno.',
  },
  kids_break: {
    emoji: '🛑',
    title: 'Salir del bucle',
    description: 'Para el bucle inmediatamente y el programa sigue con lo que viene después.',
    example: 'Si encontraste lo que buscabas → salir del bucle.',
    tip: '💡 Funciona dentro de "repetir", "mientras", "hacer/repetir" y "según el valor".',
  },
  kids_continue: {
    emoji: '⏭️',
    title: 'Saltar esta vuelta',
    description: 'Salta el resto de las acciones de esta vuelta y pasa directamente a la siguiente repetición.',
    example: 'Si el número es par → saltar; si es impar → imprimir.',
    tip: '💡 No para el bucle, solo salta lo que queda de la vuelta actual.',
  },
  kids_variable_declare: {
    emoji: '📦',
    title: 'Crear variable',
    description: 'Crea una caja con un nombre para guardar un dato que puede cambiar.',
    example: 'Variable número puntos = 0 → guarda la puntuación del juego.',
    tip: '💡 Tipos: número (int), decimal (float), sí/no (bool), texto (String).',
  },
  kids_variable_get: {
    emoji: '🔍',
    title: 'Usar variable',
    description: 'Lee el valor que está guardado en una variable.',
    example: 'Encender LED por "puntos" milisegundos.',
    tip: '💡 Este bloque tiene forma redondeada porque devuelve un valor que puedes usar en otros bloques.',
  },
  kids_variable_set: {
    emoji: '✏️',
    title: 'Cambiar variable',
    description: 'Cambia el valor guardado en una variable que ya creaste antes.',
    example: 'Cambiar variable puntos a puntos + 1',
    tip: '💡 La variable ya debe existir. Úsala después de "Crear variable".',
  },
  kids_global_var: {
    emoji: '🌐',
    title: 'Variable global',
    description: 'Crea una variable que se puede usar en TODO el programa, incluso dentro de Preparar y Repetir. Arrástrala fuera de esos bloques.',
    example: 'Variable global número contadorTotal = 0',
    tip: '💡 Usa variables globales para datos que necesitas en varias partes del programa.',
  },
  kids_const: {
    emoji: '🔒',
    title: 'Valor fijo (constante)',
    description: 'Crea un valor que nunca cambia. Perfecto para el número de un pin.',
    example: 'Valor fijo int LED = 13 → después usas LED donde sería 13.',
    tip: '💡 A diferencia de las variables, una constante no se puede cambiar mientras el programa corre.',
  },
  kids_array_declare: {
    emoji: '📋',
    title: 'Crear lista',
    description: 'Crea una lista de números del mismo tipo. Como una fila de cajitas numeradas. Arrástrala fuera de Preparar y Repetir.',
    example: 'Lista números "notas" de 7 elementos → guarda las 7 notas de la semana.',
    tip: '💡 La primera posición es 0, no 1. ¡Recuérdalo!',
  },
  kids_array_get: {
    emoji: '📖',
    title: 'Leer lista',
    description: 'Lee el valor que hay en una posición de la lista.',
    example: 'Leer lista notas posición 0 → la nota del lunes.',
    tip: '💡 La primera posición es 0. Una lista de 7 va de 0 a 6.',
  },
  kids_array_set: {
    emoji: '📝',
    title: 'Guardar en lista',
    description: 'Guarda un valor en una posición de la lista, reemplazando lo que había antes.',
    example: 'Guardar en lista notas posición 0 el valor 10',
    tip: '💡 Si la posición es mayor que el tamaño de la lista, puede causar errores.',
  },
  kids_logic: {
    emoji: '⚖️',
    title: 'Y / O lógico',
    description: '"Y (las dos)" solo es verdadero si AMBAS condiciones son verdaderas. "O (al menos una)" es verdadero si AL MENOS UNA lo es.',
    example: 'Temperatura > 30 Y luz > 500 → encender ventilador Y persiana.',
    tip: '💡 "Y" es más estricto que "O". Necesita que todo sea verdadero.',
  },
  kids_not: {
    emoji: '❌',
    title: 'Lo contrario',
    description: 'Invierte una condición: lo que era verdadero se vuelve falso, y viceversa.',
    example: 'Lo contrario de (botón presionado) → cuando NO esté presionado.',
    tip: '💡 Muy útil cuando es más fácil pensar en cuándo algo NO ocurre.',
  },
  kids_function_define: {
    emoji: '🧩',
    title: 'Crear mi bloque',
    description: 'Crea un bloque personalizado con un nombre. Puedes poner acciones dentro y reutilizarlo. Arrástralo fuera de Preparar y Repetir.',
    example: 'Crear bloque "parpadear" → apagar y encender LED 3 veces.',
    tip: '💡 Si haces lo mismo varias veces en tu programa, ¡ponlo en un bloque propio!',
  },
  kids_function_call: {
    emoji: '▶️',
    title: 'Usar mi bloque',
    description: 'Ejecuta (lanza) un bloque propio que creaste con "Crear mi bloque".',
    example: 'Usar bloque parpadear() → ejecuta las acciones que definiste.',
    tip: '💡 Escribe el mismo nombre que usaste al crearlo.',
  },
  kids_function_call_expr: {
    emoji: '🔢',
    title: 'Resultado de mi bloque',
    description: 'Ejecuta un bloque propio y usa el valor que devuelve con "Devolver".',
    example: 'Resultado de sumar(3, 4) → devuelve 7 que puedes usar en otro bloque.',
    tip: '💡 Solo funciona con bloques que devuelven un resultado (no los de "sin resultado").',
  },
  kids_return: {
    emoji: '↩️',
    title: 'Devolver un valor',
    description: 'Envía un resultado desde tu bloque propio hacia donde fue llamado.',
    example: 'Devolver temperatura * 2 → el bloque devuelve ese cálculo.',
    tip: '💡 Solo funciona dentro de un bloque creado con "Crear mi bloque" que no sea "sin resultado".',
  },
  kids_return_void: {
    emoji: '↩️',
    title: 'Terminar bloque',
    description: 'Termina la ejecución del bloque propio en ese punto sin devolver ningún valor.',
    example: 'Si el valor es incorrecto → terminar bloque (no hacer nada más).',
    tip: '💡 Útil para salir de un bloque propio antes de llegar al final.',
  },

  // ── LEDs RGB y NeoPixel ───────────────────────────────────────────────────
  kids_rgb_led: {
    emoji: '🌈',
    title: 'LED de Colores (RGB)',
    description: 'Enciende un LED de tres colores. Mezcla Rojo, Verde y Azul para hacer cualquier color del arcoíris. 0 es apagado y 255 es lo más brillante.',
    example: 'Rojo=255 Verde=0 Azul=0 → luz roja. Rojo=0 Verde=0 Azul=255 → luz azul.',
    tip: '💡 Necesitas conectar cada pin del LED a un pin PWM (~) de tu Arduino y una resistencia de 220Ω.',
  },
  kids_neopixel_setup: {
    emoji: '✨',
    title: 'Preparar Tira de Luces',
    description: 'Prepara una tira de LEDs de colores NeoPixel para usarla. Dile cuántos LEDs tiene y a qué pin está conectada. Ponlo en ⚙️ Preparar.',
    example: 'Pin 6, 8 LEDs → la tira en el pin 6 tiene 8 luces de colores listas.',
    tip: '💡 Necesitas la librería "Adafruit NeoPixel". Se agrega automáticamente al generar el código.',
  },
  kids_neopixel_brightness: {
    emoji: '🔆',
    title: 'Brillo de la Tira',
    description: 'Ajusta cuán brillante es toda la tira de luces. 0 es totalmente apagada y 255 es el máximo brillo (muy intenso).',
    example: 'Brillo=50 es suave y bonito. Brillo=255 es muy brillante.',
    tip: '💡 Ponlo en ⚙️ Preparar, justo después de "Preparar tira de luces".',
  },
  kids_neopixel_color: {
    emoji: '🎨',
    title: 'Color de una Luz',
    description: 'Elige el color de una de las luces de la tira. El número 0 es la primera luz. Mezcla Rojo, Verde y Azul (0-255) para el color que quieras.',
    example: 'Luz 0 → Rojo=255 Verde=0 Azul=0 → la primera luz se pone roja.',
    tip: '💡 Después de poner los colores, usa "Mostrar luces" para que cambien de verdad.',
  },
  kids_neopixel_show: {
    emoji: '💡',
    title: 'Mostrar Luces',
    description: 'Aplica todos los colores que pusiste en las luces. Sin este bloque, las luces no cambian aunque hayas elegido colores.',
    example: 'Pones colores → Mostrar luces → las luces cambian de color.',
    tip: '💡 Siempre termina con este bloque cuando quieras que cambien los LEDs.',
  },
  kids_neopixel_clear: {
    emoji: '🌑',
    title: 'Apagar Todas las Luces',
    description: 'Apaga todos los LEDs de la tira de colores de una sola vez.',
    example: 'Apagar todas las luces → la tira queda completamente oscura.',
    tip: '💡 Este bloque también llama a "Mostrar luces" automáticamente, así que no hace falta ponerlo después.',
  },
};
