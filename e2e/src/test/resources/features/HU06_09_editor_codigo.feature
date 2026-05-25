# language: es
@HU-06 @HU-07 @HU-09 @editor-codigo
Característica: HU-06 al HU-09 Editor de Código (Monaco)
  Como usuario de Arduino Blocks IDE
  Quiero visualizar y editar el código generado
  Para revisar y ajustar el programa Arduino

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-06
  Escenario: El editor Monaco es visible junto al editor de bloques
    Entonces el editor de codigo Monaco es visible

  @HU-06
  Escenario: El editor de código muestra el archivo sketch.ino
    Entonces el encabezado del archivo .ino es visible

  @HU-06
  Escenario: El código generado contiene la estructura básica de Arduino
    Entonces el codigo generado contiene "void setup()"
    Y el codigo generado contiene "void loop()"

  @HU-07
  Escenario: El editor de código es editable por el usuario
    Entonces el editor de codigo es editable

  @HU-07
  Escenario: El botón Copiar está disponible en el editor de código
    Entonces el boton Copiar es visible

  @HU-09
  Escenario: El botón Guardar como ino está disponible
    Entonces el boton Guardar como .ino es visible

  @HU-06 @HU-07
  Escenario: El editor Monaco tiene el archivo sketch disponible y es editable
    Entonces el encabezado del archivo .ino es visible
    Y el editor de codigo es editable
