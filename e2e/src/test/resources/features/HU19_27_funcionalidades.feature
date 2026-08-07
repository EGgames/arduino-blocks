# language: es
@HU-19 @HU-20 @HU-21 @HU-22 @HU-23 @HU-24 @HU-25 @HU-26 @HU-27 @funcionalidades
Característica: HU-19 a HU-27 Compilación, archivos, temas y bloques personalizados
  Como usuario de Arduino Blocks IDE
  Quiero compilar, guardar, abrir, personalizar la apariencia y crear mis propios bloques
  Para trabajar cómodamente con mis proyectos

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-19
  Escenario: La verificación de código está disponible en el panel de subida
    Cuando el usuario navega a la pestana "Subir"
    Entonces el boton "Verificar" es visible

  @HU-19
  Escenario: En el navegador la verificación indica que requiere la app de escritorio
    Cuando el usuario navega a la pestana "Subir"
    Entonces el boton "Verificar" esta deshabilitado
    Y el boton "Subir" esta deshabilitado

  @HU-20
  Escenario: El proyecto se puede guardar desde la barra de herramientas
    Entonces el boton Guardar es visible
    Y el boton Guardar tiene el atributo de accesibilidad correcto

  @HU-21
  Escenario: Existe la acción de abrir un archivo existente
    Entonces el boton "Abrir" es visible
    Y el boton "Nuevo" es visible

  @HU-22
  Escenario: El usuario puede cambiar al tema claro y volver al oscuro
    Cuando el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Claro"
    Entonces el tema activo de la aplicacion es "light"
    Cuando el usuario hace clic en el boton "Oscuro"
    Entonces el tema activo de la aplicacion es "dark"

  @HU-23
  Escenario: El workspace de Blockly adopta el tema seleccionado
    Cuando el usuario abre el dialogo de configuracion
    Y el usuario hace clic en el boton "Claro"
    Entonces el tema activo de la aplicacion es "light"
    Y el workspace de Blockly usa un fondo propio del tema

  @HU-24
  Escenario: El panel de librerías adopta el tema seleccionado
    Entonces el panel de librerias es visible
    Y el panel de librerias usa un fondo propio del tema

  @HU-25
  Escenario: El workspace se adapta al redimensionar la ventana
    Cuando el usuario redimensiona la ventana a 1024 por 768
    Entonces el lienzo de Blockly se adapta al nuevo tamano

  @HU-26
  Escenario: El usuario puede crear un bloque personalizado
    Cuando el usuario navega a la pestana "Bloques"
    Y el usuario crea el bloque personalizado "Activar motor" con el codigo "motor.setSpeed(255);"
    Entonces la lista de bloques personalizados contiene "Activar motor"

  @HU-27
  Escenario: El usuario puede insertar su bloque personalizado en el workspace
    Cuando el usuario navega a la pestana "Bloques"
    Y el usuario crea el bloque personalizado "Parar motor" con el codigo "motor.run(RELEASE);"
    Y el usuario inserta el bloque personalizado en el workspace
    Y el workspace tiene mas bloques que antes
