# language: es
@HU-01 @inicializacion
Característica: HU-01 Inicialización de la aplicación
  Como usuario de Arduino Blocks IDE
  Quiero que la aplicación se inicie correctamente
  Para comenzar a programar de inmediato

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  Escenario: La barra de título muestra el nombre de la aplicación
    Entonces se muestra el encabezado "Arduino"
    Y se muestra el texto "Blocks IDE"

  Escenario: La aplicación indica el modo Web
    Entonces se muestra el indicador de modo Web

  Escenario: El editor de bloques carga el espacio de trabajo predeterminado
    Entonces el espacio de trabajo Blockly es visible

  Escenario: El código generado contiene las funciones básicas de Arduino
    Entonces el codigo generado contiene "void setup()"
    Y el codigo generado contiene "void loop()"

  Escenario: El bloque setup está presente en el espacio de trabajo
    Entonces el bloque "setup" es visible en el workspace

  Escenario: El bloque loop está presente en el espacio de trabajo
    Entonces el bloque "loop" es visible en el workspace
