# Historias de usuario — Arduino Blocks

## Roles

| Rol | Descripción |
|-----|-------------|
| **Estudiante** | Persona que aprende programación Arduino por primera vez |
| **Maker** | Desarrollador con experiencia que construye proyectos propios |
| **Docente** | Profesor que usa la herramienta en clases de robótica o electrónica |

---

## Épica 1 — Editor de bloques

### HU-01 · Estructura básica del programa

> **Como** estudiante,  
> **quiero** ver un bloque `setup` y `loop` ya colocados al abrir la aplicación,  
> **para** entender la estructura de un programa Arduino sin necesidad de conocimientos previos de C++.

**Criterios de aceptación:**
- Al iniciar la aplicación, el workspace muestra los bloques `setup` y `loop` vacíos.
- Los bloques `setup` y `loop` no se pueden borrar ni mover fuera de la estructura.
- El código generado refleja correctamente `void setup()` y `void loop()`.

---

### HU-02 · Arrastrar y soltar bloques

> **Como** estudiante,  
> **quiero** construir mi programa arrastrando bloques desde la barra lateral,  
> **para** aprender a programar sin tener que escribir código manualmente.

**Criterios de aceptación:**
- El toolbox tiene categorías visibles: Control, E/S Digital, E/S Analógica, Serial, Variables, Tiempo, Matemáticas, Librerías.
- Se puede arrastrar cualquier bloque al workspace y conectarlo.
- Al soltar un bloque en un lugar inválido, regresa a su posición original.

---

### HU-03 · Usar control de flujo

> **Como** estudiante,  
> **quiero** usar bloques `if`, `for` y `while`,  
> **para** implementar lógica condicional y bucles en mis proyectos.

**Criterios de aceptación:**
- El bloque `if/else` permite conectar una condición y dos ramas de instrucciones.
- El bloque `if` sin `else` (`arduino_if_simple`) está disponible para casos simples.
- El bloque `for` permite configurar variable, valor inicial, final y paso.
- El bloque `while` acepta cualquier condición como entrada.

---

### HU-04 · Declarar y usar variables

> **Como** maker,  
> **quiero** declarar variables con tipo y nombre desde un bloque,  
> **para** almacenar valores entre iteraciones del loop o entre funciones.

**Criterios de aceptación:**
- El bloque de declaración permite elegir tipo (`int`, `float`, `bool`, `String`, `byte`, `long`).
- El nombre de la variable se puede escribir directamente en el bloque.
- Los bloques "leer variable" y "asignar variable" referencian la misma variable por nombre.

---

### HU-05 · Añadir comentarios al código

> **Como** docente,  
> **quiero** insertar bloques de comentario en el workspace,  
> **para** explicar el propósito de cada sección a mis estudiantes.

**Criterios de aceptación:**
- El bloque de comentario genera `// texto` en el código C++.
- El texto del comentario se puede editar directamente en el bloque.

---

## Épica 2 — Editor de código

### HU-06 · Ver el código generado

> **Como** maker,  
> **quiero** ver en tiempo real el código C++ generado por mis bloques,  
> **para** comprender la traducción y aprender la sintaxis de Arduino.

**Criterios de aceptación:**
- El panel de código se actualiza automáticamente cada vez que cambian los bloques.
- El código tiene resaltado de sintaxis C++/Arduino.
- El editor muestra números de línea.

---

### HU-07 · Editar el código directamente

> **Como** maker,  
> **quiero** modificar el código C++ a mano cuando los bloques no son suficientes,  
> **para** agregar funcionalidades avanzadas que no tienen bloque equivalente.

**Criterios de aceptación:**
- El editor de código es editable (no solo lectura).
- El cursor y la selección se mantienen estables durante actualizaciones externas.
- El autocompletado sugiere funciones de Arduino (`pinMode`, `digitalWrite`, `Serial.begin`, etc.).

---

### HU-08 · Ajustar el tamaño de fuente

> **Como** docente,  
> **quiero** aumentar el tamaño de fuente del editor de código al proyectar en clase,  
> **para** que los estudiantes puedan leer el código desde sus asientos.

**Criterios de aceptación:**
- El tamaño de fuente se puede cambiar entre 10 y 20 px desde el panel de configuración.
- El cambio se aplica inmediatamente al editor Monaco.
- El valor elegido persiste entre sesiones.

---

### HU-09 · Copiar el código al portapapeles

> **Como** maker,  
> **quiero** copiar el código generado con un solo clic,  
> **para** pegarlo en el IDE de Arduino o compartirlo rápidamente.

**Criterios de aceptación:**
- Hay un botón de copiar en la barra del editor de código.
- Al hacer clic, el código completo se copia al portapapeles.
- Se muestra una confirmación visual (snackbar) tras la copia.

---

## Épica 3 — Sincronización bidireccional

### HU-10 · Cambios en bloques reflejados en código

> **Como** estudiante,  
> **quiero** que al modificar un bloque el código se actualice al instante,  
> **para** ver la relación directa entre el bloque y las instrucciones C++.

**Criterios de aceptación:**
- Cada vez que se agrega, borra, mueve o modifica un bloque, el código se regenera en menos de 200 ms.
- No se producen parpadeos ni reseteos del cursor en el editor de código.

---

### HU-11 · Cambios en código reflejados en bloques

> **Como** maker,  
> **quiero** que al editar el código textualmente los bloques se actualicen,  
> **para** mantener ambas vistas sincronizadas y poder alternar entre ellas.

**Criterios de aceptación:**
- Tras 700 ms de inactividad en el editor de texto, los bloques se regeneran.
- Si el código no es parseable como bloques, el indicador de estado pasa a rojo pero los bloques no se borran.
- Si el código vuelve a ser válido, los bloques se reconstruyen correctamente.

---

### HU-12 · Indicador de estado de sincronización

> **Como** maker,  
> **quiero** ver un indicador que muestre si la sincronización es correcta o hay errores,  
> **para** saber en todo momento si bloques y código están alineados.

**Criterios de aceptación:**
- El indicador muestra verde (sincronizado), azul/girando (actualizando) o rojo (error de parseo).
- El indicador es visible desde ambos editores.

---

## Épica 4 — Gestor de librerías

### HU-13 · Explorar librerías disponibles

> **Como** maker,  
> **quiero** ver el catálogo de librerías Arduino disponibles,  
> **para** descubrir qué funcionalidades puedo añadir a mi proyecto.

**Criterios de aceptación:**
- El panel de librerías muestra nombre, descripción y categoría de cada librería.
- El catálogo incluye al menos 55 librerías.
- Las librerías están agrupadas por categoría con un color de acento distinto.

---

### HU-14 · Buscar una librería

> **Como** maker,  
> **quiero** buscar librerías por nombre o descripción,  
> **para** encontrar rápidamente la que necesito sin recorrer toda la lista.

**Criterios de aceptación:**
- El campo de búsqueda filtra en tiempo real mientras el usuario escribe.
- La búsqueda es insensible a mayúsculas/minúsculas.
- Si no hay resultados, se muestra un mensaje indicativo.

---

### HU-15 · Añadir una librería al proyecto

> **Como** maker,  
> **quiero** hacer clic en una librería para añadirla al programa,  
> **para** incluir su cabecera `#include` sin escribir código manualmente.

**Criterios de aceptación:**
- Al hacer clic en una librería, se inserta el bloque `#include <librería.h>` en el workspace.
- Si la librería ya está incluida, el bloque no se duplica.
- Las librerías ya incluidas muestran un icono de verificación en la lista.

---

## Épica 5 — Compilación y subida

### HU-16 · Seleccionar el puerto COM

> **Como** maker,  
> **quiero** seleccionar el puerto COM de mi Arduino desde la aplicación,  
> **para** no tener que consultar el Administrador de dispositivos cada vez.

**Criterios de aceptación:**
- El selector de puerto muestra todos los puertos serie disponibles en el sistema.
- Hay un botón para actualizar la lista sin reiniciar la aplicación.
- El puerto seleccionado persiste entre sesiones (localStorage).

---

### HU-17 · Seleccionar la placa Arduino

> **Como** maker,  
> **quiero** elegir el modelo de placa desde una lista desplegable,  
> **para** que la compilación use los parámetros correctos (`--fqbn`).

**Criterios de aceptación:**
- La lista incluye las placas más comunes: Uno, Nano, Mega, Leonardo, ESP32, ESP8266, etc.
- La placa seleccionada persiste entre sesiones.
- El FQBN de la placa seleccionada se usa automáticamente al compilar/subir.

---

### HU-18 · Subir el programa a la placa

> **Como** maker,  
> **quiero** compilar y subir mi programa con un solo clic,  
> **para** probar el resultado en la placa física sin salir de la aplicación.

**Criterios de aceptación:**
- El botón "Subir" compila el sketch y lo sube al puerto/placa configurados.
- El output de `arduino-cli` se muestra en tiempo real en un log.
- Al terminar, se indica éxito o se muestran los errores de compilación.
- La operación es posible solo cuando hay puerto y placa seleccionados.

---

### HU-19 · Solo compilar sin subir

> **Como** maker,  
> **quiero** compilar el código sin subirlo a la placa,  
> **para** verificar que no hay errores de sintaxis antes de conectar el hardware.

**Criterios de aceptación:**
- Existe un botón o acción de "Solo compilar".
- El resultado de la compilación se muestra en el log.
- No se requiere que haya un puerto COM conectado.

---

## Épica 6 — Gestión de archivos

### HU-20 · Guardar el proyecto

> **Como** maker,  
> **quiero** guardar el código generado como archivo `.ino`,  
> **para** tener una copia del programa fuera de la aplicación.

**Criterios de aceptación:**
- El botón "Guardar" abre un diálogo nativo del sistema operativo.
- El archivo se guarda con extensión `.ino` por defecto.
- El workspace de bloques se guarda automáticamente en localStorage.

---

### HU-21 · Abrir un archivo existente

> **Como** maker,  
> **quiero** abrir un archivo `.ino` desde el disco,  
> **para** continuar trabajando en un proyecto guardado anteriormente.

**Criterios de aceptación:**
- El botón "Abrir" muestra un selector de archivos del sistema.
- El contenido del `.ino` carga en el editor de código.
- La sincronización inversa intenta reconstruir los bloques a partir del código cargado.

---

## Épica 7 — Apariencia y configuración

### HU-22 · Cambiar el tema visual

> **Como** usuario,  
> **quiero** poder elegir entre tema oscuro, claro o el del sistema operativo,  
> **para** usar la aplicación en el entorno de iluminación que prefiera.

**Criterios de aceptación:**
- Las opciones disponibles son: Oscuro, Claro, Sistema.
- El cambio se aplica inmediatamente en toda la interfaz (AppBar, workspace Blockly, Monaco, paneles).
- La preferencia se guarda y se restaura al reabrir la aplicación.

---

### HU-23 · Tema oscuro en el workspace de Blockly

> **Como** usuario,  
> **quiero** que el fondo del workspace de Blockly respete el tema oscuro seleccionado,  
> **para** no tener un área blanca que contraste con el resto de la UI en modo oscuro.

**Criterios de aceptación:**
- En tema oscuro, el fondo del workspace Blockly usa el color `#1a2335`.
- La cuadrícula de fondo usa un color tenue y no distrae.
- El flyout (panel de bloques) también usa colores del tema oscuro.

---

### HU-24 · Tema oscuro en el panel de librerías

> **Como** usuario,  
> **quiero** que el panel de librerías use colores del tema activo,  
> **para** que toda la interfaz tenga una apariencia coherente.

**Criterios de aceptación:**
- En tema oscuro, el fondo, bordes, texto e inputs del panel de librerías usan la paleta oscura.
- En tema claro, el panel usa la paleta clara.
- No hay elementos con fondo blanco visible en modo oscuro.

---

### HU-25 · Workspace Blockly que se adapta al resize

> **Como** usuario,  
> **quiero** que el workspace de Blockly llene siempre su contenedor al redimensionar la ventana,  
> **para** no ver áreas blancas o grises cuando ajusto el tamaño de los paneles.

**Criterios de aceptación:**
- Al arrastrar el divisor entre el workspace y el editor de código, Blockly redibuja su canvas.
- Al arrastrar el divisor vertical (panel inferior), Blockly se reajusta.
- Al redimensionar la ventana de la aplicación, no quedan áreas sin pintar.

---

## Épica 8 — Bloques personalizados

### HU-26 · Crear un bloque personalizado

> **Como** maker,  
> **quiero** definir mis propios bloques con código C++ personalizado,  
> **para** encapsular lógica repetitiva de mis proyectos en un bloque reutilizable.

**Criterios de aceptación:**
- El panel de bloques personalizados permite escribir: etiqueta, código C++ y color.
- Al crear el bloque, aparece disponible en el workspace.
- Los bloques personalizados se guardan en localStorage y persisten entre sesiones.

---

### HU-27 · Insertar un bloque personalizado

> **Como** maker,  
> **quiero** insertar un bloque personalizado en el workspace desde el panel,  
> **para** usarlo dentro de la estructura de mi programa.

**Criterios de aceptación:**
- Cada bloque personalizado tiene un botón "Insertar".
- Al insertarlo, aparece en el workspace de Blockly.
- El generador produce el código C++ definido al crear el bloque.

---

## Resumen

| ID | Épica | Prioridad |
|----|-------|-----------|
| HU-01 a HU-05 | Editor de bloques | Alta |
| HU-06 a HU-09 | Editor de código | Alta |
| HU-10 a HU-12 | Sincronización bidireccional | Alta |
| HU-13 a HU-15 | Gestor de librerías | Media |
| HU-16 a HU-19 | Compilación y subida | Alta |
| HU-20 a HU-21 | Gestión de archivos | Media |
| HU-22 a HU-25 | Apariencia y configuración | Media |
| HU-26 a HU-27 | Bloques personalizados | Baja |

**Total: 27 historias de usuario**
