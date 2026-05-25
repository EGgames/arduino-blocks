# language: es
@HU-13 @HU-14 @HU-15 @librerias
Característica: HU-13 al HU-15 Gestión de Librerías Arduino
  Como usuario de Arduino Blocks IDE
  Quiero explorar, buscar e incluir librerías Arduino en mi proyecto
  Para reutilizar código de hardware y facilitar el desarrollo

  Antecedentes:
    Dado que el usuario abre la aplicacion Arduino Blocks

  @HU-13
  Escenario: El panel de librerías se muestra por defecto
    Entonces el panel de librerias es visible
    Y la pestana "Librerías" esta seleccionada

  @HU-13
  Escenario: El panel de librerías muestra más de 50 librerías disponibles
    Entonces el panel de librerias contiene mas de 50 librerias

  @HU-13
  Escenario: El panel de librerías muestra la categoría Todas
    Entonces la categoria de libreria "Todas" existe

  @HU-13
  Escenario: El panel de librerías muestra categorías de filtrado
    Entonces la categoria de libreria "Comunicación" existe
    Y la categoria de libreria "Sensores" existe
    Y la categoria de libreria "Displays" existe
    Y la categoria de libreria "Motores" existe

  @HU-13
  Escenario: Filtrar por categoría Comunicación muestra librerías relevantes
    Cuando el usuario filtra las librerias por categoria "Comunicación"
    Entonces la lista de librerias contiene "Wire"

  @HU-13
  Escenario: Filtrar por categoría Sensores muestra librerías relevantes
    Cuando el usuario filtra las librerias por categoria "Sensores"
    Entonces la lista de librerias contiene "DHT"

  @HU-14
  Escenario: La búsqueda de librerías filtra por nombre
    Cuando el usuario busca la libreria "Servo"
    Entonces la lista de librerias contiene "Servo"

  @HU-14
  Escenario: La búsqueda es insensible a mayúsculas y minúsculas
    Cuando el usuario busca la libreria "wire"
    Entonces la lista de librerias contiene "Wire"

  @HU-14
  Escenario: La búsqueda sin resultados muestra el mensaje correspondiente
    Cuando el usuario busca la libreria "xyzlibreria123abc"
    Entonces se muestra el mensaje de sin resultados

  @HU-14
  Escenario: Limpiar la búsqueda restaura todas las librerías
    Cuando el usuario busca la libreria "Servo"
    Y el usuario limpia el campo de busqueda
    Entonces el panel de librerias contiene mas de 50 librerias

  @HU-15
  Escenario: El usuario puede agregar una librería al proyecto
    Cuando el usuario agrega la libreria "Wire"
    Entonces la libreria "Wire" esta incluida en el proyecto
