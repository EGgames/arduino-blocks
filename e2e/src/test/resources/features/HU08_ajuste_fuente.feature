# language: es
@HU-08 @ajuste-fuente
Característica: HU-08 Ajuste del Tamaño de Fuente
  Como usuario de Arduino Blocks IDE
  Quiero ajustar el tamaño de fuente del editor de código
  Para facilitar la lectura según mis preferencias

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  Escenario: El diálogo de configuración muestra el control de tamaño de fuente
    Cuando el usuario abre el dialogo de configuracion
    Entonces el control de tamano de fuente es visible

  Escenario: El tamaño de fuente actual se muestra en la configuración
    Cuando el usuario abre el dialogo de configuracion
    Entonces la etiqueta de tamano de fuente es visible

  Escenario: El diálogo de configuración se puede cerrar
    Cuando el usuario abre el dialogo de configuracion
    Y el usuario cierra el dialogo de configuracion
    Entonces el dialogo de configuracion esta cerrado
