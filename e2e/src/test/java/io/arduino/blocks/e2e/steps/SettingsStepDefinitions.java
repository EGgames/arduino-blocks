package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.SettingsPage;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

public class SettingsStepDefinitions {

    @Steps
    SettingsPage settingsPage;

    @Entonces("el dialogo de configuracion se abre")
    public void elDialogoDeConfiguracionSeAbre() {
        assertThat(settingsPage.isDialogVisible()).isTrue();
    }

    @Entonces("el dialogo de configuracion es visible")
    public void elDialogoDeConfiguracionEsVisible() {
        assertThat(settingsPage.isDialogVisible()).isTrue();
    }

    @Entonces("el control de tamano de fuente es visible")
    public void elControlDeTamanoDeFuenteEsVisible() {
        assertThat(settingsPage.isFontSizeControlVisible()).isTrue();
    }

    @Entonces("la etiqueta de tamano de fuente es visible")
    public void laEtiquetaDeTamanoDeFuenteEsVisible() {
        assertThat(settingsPage.isFontSizeLabelVisible()).isTrue();
    }

    @Cuando("el usuario cierra el dialogo de configuracion")
    public void elUsuarioCierraElDialogoDeConfiguracion() {
        settingsPage.closeDialog();
    }

    @Entonces("el dialogo de configuracion esta cerrado")
    public void elDialogoDeConfiguracionEstaCerrado() {
        assertThat(settingsPage.isDialogClosed()).isTrue();
    }

    @Entonces("se muestra el mensaje COM del modo web")
    public void seMuestraElMensajeCOMDelModoWeb() {
        assertThat(settingsPage.isComWebMessageVisible()).isTrue();
    }

    @Entonces("la seccion de placa es visible")
    public void laSeccionDePlacaEsVisible() {
        assertThat(settingsPage.isBoardSectionVisible()).isTrue();
    }

    @Entonces("el boton de tema {string} es visible")
    public void elBotonDeTemaEsVisible(String themeName) {
        assertThat(settingsPage.isThemeButtonVisible(themeName)).isTrue();
    }

    @Cuando("el usuario hace clic en el boton de tema {string}")
    public void elUsuarioHaceClicEnElBotonDeTema(String themeName) {
        settingsPage.clickThemeButton(themeName);
    }
}
