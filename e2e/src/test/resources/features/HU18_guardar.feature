# language: es
@HU-18 @guardar
Característica: HU-18 Guardar Proyecto
  Como usuario de Arduino Blocks IDE
  Quiero guardar mi proyecto
  Para conservar el código programado

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  Escenario: El botón Guardar es visible en la barra de herramientas
    Entonces el boton Guardar es visible

  Escenario: El botón Guardar tiene el atributo de accesibilidad correcto
    Entonces el boton Guardar tiene el atributo de accesibilidad correcto

  Escenario: El botón Guardar puede ser activado por el usuario
    Cuando el usuario hace clic en el boton Guardar
    Entonces el boton Guardar es visible

  Escenario: La navegación de pestañas funciona correctamente
    Cuando el usuario navega a la pestana "Bloques"
    Entonces la pestana "Bloques" esta seleccionada
    Cuando el usuario navega a la pestana "Librerías"
    Entonces la pestana "Librerías" esta seleccionada
