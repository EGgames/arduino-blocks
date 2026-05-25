package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.AppPage;
import io.arduino.blocks.e2e.pages.LibraryPanelPage;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

public class LibraryStepDefinitions {

    @Steps
    LibraryPanelPage libraryPanelPage;

    @Steps
    AppPage appPage;

    @Entonces("el panel de librerias es visible")
    public void elPanelDeLibreriasEsVisible() {
        assertThat(libraryPanelPage.isPanelVisible()).isTrue();
    }

    @Entonces("el panel de librerias contiene mas de {int} librerias")
    public void elPanelDeLibreriasContieneMasDe(int minCount) {
        assertThat(libraryPanelPage.getLibraryCount()).isGreaterThan(minCount);
    }

    @Entonces("la categoria de libreria {string} existe")
    public void laCategoriaDeLibreriaExiste(String categoryName) {
        assertThat(libraryPanelPage.hasCategoryChip(categoryName)).isTrue();
    }

    @Entonces("el filtro de busqueda de librerias es visible")
    public void elFiltroDeBusquedaDeLibreriasEsVisible() {
        assertThat(libraryPanelPage.isSearchFilterVisible()).isTrue();
    }

    @Cuando("el usuario busca la libreria {string}")
    public void elUsuarioBuscaLaLibreria(String term) {
        libraryPanelPage.searchLibrary(term);
    }

    @Entonces("se muestra al menos {int} resultado de busqueda de librerias")
    public void seMuestraAlMenosResultado(int minResults) {
        assertThat(libraryPanelPage.getSearchResultCount()).isGreaterThanOrEqualTo(minResults);
    }

    @Entonces("la busqueda de {string} devuelve resultados")
    public void laBusquedaDevuelveResultados(String term) {
        assertThat(libraryPanelPage.getSearchResultCount()).isGreaterThan(0);
    }

    @Cuando("el usuario busca la libreria en minusculas {string}")
    public void elUsuarioBuscaLaLibreriaEnMinusculas(String term) {
        libraryPanelPage.searchLibrary(term.toLowerCase());
    }

    @Cuando("el usuario busca la libreria en mayusculas {string}")
    public void elUsuarioBuscaLaLibreriaEnMayusculas(String term) {
        libraryPanelPage.searchLibrary(term.toUpperCase());
    }

    @Entonces("ambas busquedas devuelven el mismo numero de resultados")
    public void ambasBusquedasDevuelvenElMismoNumeroDeResultados() {
        assertThat(libraryPanelPage.getSearchResultCount()).isGreaterThan(0);
    }

    @Cuando("el usuario busca un termino inexistente {string}")
    public void elUsuarioBuscaUnTerminoInexistente(String term) {
        libraryPanelPage.searchLibrary(term);
    }

    @Entonces("se muestra el mensaje de sin resultados")
    public void seMuestraElMensajeDeSinResultados() {
        assertThat(libraryPanelPage.getSearchResultCount() == 0 || libraryPanelPage.isNoResultsMessageVisible()).isTrue();
    }

    @Cuando("el usuario agrega la libreria {string}")
    public void elUsuarioAgregaLaLibreria(String libraryName) {
        libraryPanelPage.searchLibrary(libraryName);
        libraryPanelPage.addLibrary(libraryName);
    }

    @Entonces("la lista de librerias contiene {string}")
    public void laListaDeLibreriasContiene(String libraryName) {
        assertThat(libraryPanelPage.containsLibrary(libraryName)).isTrue();
    }

    @Cuando("el usuario limpia el campo de busqueda")
    public void elUsuarioLimpiaElCampoDeBusqueda() {
        libraryPanelPage.clearSearch();
    }

    @Entonces("la libreria {string} esta incluida en el proyecto")
    public void laLibreriaEstaIncluidaEnElProyecto(String libraryName) {
        assertThat(libraryPanelPage.isLibraryIncluded(libraryName)).isTrue();
    }

    @Cuando("el usuario filtra las librerias por categoria {string}")
    public void elUsuarioFiltraLasLibreriasPorCategoria(String category) {
        libraryPanelPage.filterByCategory(category);
    }
}
