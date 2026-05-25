# language: es
@HU-16 @HU-17 @configuracion
Característica: HU-16 y HU-17 Configuración de Puerto COM y Placa
  Como usuario de Arduino Blocks IDE
  Quiero configurar la placa y el puerto de conexión
  Para poder subir programas al hardware correcto

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-17
  Escenario: El botón de configuración es visible en la barra de herramientas
    Entonces el boton de configuracion es visible

  @HU-17
  Escenario: El diálogo de configuración se abre al hacer clic
    Cuando el usuario abre el dialogo de configuracion
    Entonces el dialogo de configuracion es visible

  @HU-17
  Escenario: El diálogo de configuración contiene sección de placa
    Cuando el usuario abre el dialogo de configuracion
    Entonces la seccion de placa es visible

  @HU-16
  Escenario: En modo Web se indica que el puerto COM solo está disponible en escritorio
    Cuando el usuario abre el dialogo de configuracion
    Entonces se muestra el mensaje COM del modo web

  @HU-17
  Escenario: Los botones de tema están disponibles en configuración
    Cuando el usuario abre el dialogo de configuracion
    Entonces el boton de tema "Oscuro" es visible
    Y el boton de tema "Claro" es visible
    Y el boton de tema "Sistema" es visible

  Escenario: La navegación a la pestaña Subir muestra el panel de carga
    Cuando el usuario navega a la pestana "Subir"
    Entonces el panel de la pestana "Subir" es visible
