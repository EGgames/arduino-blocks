# language: es
@HU-02 @HU-03 @HU-04 @HU-05 @editor-bloques
Característica: HU-02 al HU-05 Editor de Bloques (Blockly)
  Como usuario de Arduino Blocks IDE
  Quiero disponer de una caja de herramientas con bloques
  Para construir programas Arduino mediante arrastrar y soltar

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-02
  Escenario: La caja de herramientas Blockly es visible
    Entonces la caja de herramientas es visible
    Y la caja de herramientas contiene la categoria "⚙️ Estructura"

  @HU-02
  Escenario: Las categorías de bloques Arduino están disponibles
    Entonces la caja de herramientas contiene la categoria "⚙️ Estructura"
    Y la caja de herramientas contiene la categoria "📌 Pines Digitales"
    Y la caja de herramientas contiene la categoria "📡 Serial"
    Y la caja de herramientas contiene la categoria "⏱️ Tiempo"

  @HU-03
  Escenario: La categoría de control está disponible para estructuras de flujo
    Entonces la caja de herramientas contiene la categoria "🔁 Control"

  @HU-04
  Escenario: La categoría de variables está disponible
    Entonces la caja de herramientas contiene la categoria "📦 Variables"

  @HU-04
  Escenario: La categoría de matemáticas está disponible
    Entonces la caja de herramientas contiene la categoria "🔢 Matemáticas"

  @HU-05
  Escenario: La categoría de lógica está disponible para condiciones
    Entonces la caja de herramientas contiene la categoria "✔️ Lógica"

  @HU-02
  Escenario: El espacio de trabajo Blockly acepta interacciones del usuario
    Entonces el espacio de trabajo Blockly es visible
    Y el espacio de trabajo Blockly esta habilitado para interaccion
