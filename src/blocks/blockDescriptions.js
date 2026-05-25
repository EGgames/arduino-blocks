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
