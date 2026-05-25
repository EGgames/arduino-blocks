# language: es
@HU-10 @HU-11 @HU-12 @sincronizacion
Característica: HU-10 al HU-12 Sincronización Bloques-Código
  Como usuario de Arduino Blocks IDE
  Quiero que los bloques y el código se sincronicen automáticamente
  Para mantener la coherencia entre ambas representaciones del programa

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-12
  Escenario: El indicador de sincronización es visible
    Entonces el indicador de sincronizacion es visible

  @HU-12
  Escenario: El estado inicial de sincronización es Sincronizado
    Entonces el estado de sincronizacion es "Sincronizado"

  @HU-10
  Escenario: Los cambios en bloques se reflejan en el editor de código
    Entonces el editor de codigo Monaco es visible
    Y el codigo generado contiene "void setup()"
    Y el codigo generado contiene "void loop()"

  @HU-11
  Escenario: La sincronización bidireccional está habilitada
    Entonces el editor de codigo es editable
    Y el indicador de sincronizacion es visible
