# language: es
@HU-31 @version @v1.3
Característica: HU-31 Identificación de la versión de la aplicación
  Como usuario de Arduino Blocks IDE
  Quiero ver qué versión estoy usando
  Para saber si dispongo de las últimas funcionalidades

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-31
  Escenario: La barra de estado muestra la versión 1.3
    Entonces se muestra el texto "Arduino Blocks IDE v1.3.0"

  @HU-31
  Escenario: La barra de estado muestra el estado de sincronización
    Entonces se muestra el texto "Sincronizado"
