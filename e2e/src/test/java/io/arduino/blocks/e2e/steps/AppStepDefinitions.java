package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.AppPage;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import io.cucumber.java.es.Cuando;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

public class AppStepDefinitions {

    @Steps
    AppPage appPage;

    @Dado("que el usuario abre la aplicacion Arduino Blocks")
    public void elUsuarioAbreLaAplicacion() {
        appPage.openApp();
    }

    @Dado("que el usuario ha abierto la aplicacion Arduino Blocks")
    public void elUsuarioHaAbiertoLaAplicacion() {
        appPage.openApp();
    }

    @Entonces("la aplicacion carga correctamente")
    public void laAplicacionCargaCorrectamente() {
        assertThat(appPage.isHeadingVisible("Arduino")).isTrue();
    }

    @Entonces("se muestra el encabezado {string}")
    public void seMuestraElEncabezado(String text) {
        assertThat(appPage.isHeadingVisible(text)).isTrue();
    }

    @Entonces("el titulo de la aplicacion contiene {string}")
    public void elTituloDeLaAplicacionContiene(String text) {
        assertThat(appPage.isHeadingVisible(text)).isTrue();
    }

    @Entonces("se muestra el texto {string}")
    public void seMuestraElTexto(String text) {
        assertThat(appPage.isTextVisible(text)).isTrue();
    }

    @Entonces("se muestra el indicador de modo Web")
    public void seMuestraElIndicadorDeModoWeb() {
        assertThat(appPage.isWebIndicatorVisible()).isTrue();
    }

    @Entonces("el boton Guardar es visible")
    public void elBotonGuardarEsVisible() {
        assertThat(appPage.isGuardarButtonVisible()).isTrue();
    }

    @Entonces("el boton Guardar tiene el atributo de accesibilidad correcto")
    public void elBotonGuardarTieneElAtributoDeAccesibilidadCorrecto() {
        assertThat(appPage.guardarButtonHasAccessibilityLabel()).isTrue();
    }

    @Cuando("el usuario hace clic en el boton Guardar")
    public void elUsuarioHaceClicEnElBotonGuardar() {
        appPage.clickGuardar();
    }

    @Entonces("el boton de configuracion es visible")
    public void elBotonDeConfiguracionEsVisible() {
        assertThat(appPage.isSettingsButtonVisible()).isTrue();
    }

    @Cuando("el usuario hace clic en el boton de configuracion")
    public void elUsuarioHaceClicEnElBotonDeConfiguracion() {
        appPage.clickSettings();
    }

    @Cuando("el usuario abre el dialogo de configuracion")
    public void elUsuarioAbreElDialogoDeConfiguracion() {
        appPage.clickSettings();
    }

    @Cuando("el usuario navega a la pestana {string}")
    public void elUsuarioNavegaALaPestana(String tabLabel) {
        appPage.clickTab(tabLabel);
    }

    @Entonces("la pestana {string} esta seleccionada")
    public void laPestanaEstaSeleccionada(String tabLabel) {
        assertThat(appPage.isTabSelected(tabLabel)).isTrue();
    }

    @Entonces("el panel de la pestana {string} es visible")
    public void elPanelDeLaPestanaEsVisible(String tabLabel) {
        assertThat(appPage.isTabPanelVisible(tabLabel)).isTrue();
    }
}
