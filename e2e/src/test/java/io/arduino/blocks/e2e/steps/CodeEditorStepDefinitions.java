package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.CodeEditorPage;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

public class CodeEditorStepDefinitions {

    @Steps
    CodeEditorPage codeEditorPage;

    @Entonces("el editor de codigo Monaco es visible")
    public void elEditorDeCodigoMonacoEsVisible() {
        assertThat(codeEditorPage.isEditorVisible()).isTrue();
    }

    @Entonces("el encabezado del archivo .ino es visible")
    public void elEncabezadoDelArchivoInoEsVisible() {
        assertThat(codeEditorPage.isSketchHeaderVisible()).isTrue();
    }

    @Entonces("el codigo generado contiene {string}")
    public void elCodigoGeneradoContiene(String text) {
        assertThat(codeEditorPage.codeContains(text)).isTrue();
    }

    @Entonces("el editor de codigo es editable")
    public void elEditorDeCodigoEsEditable() {
        assertThat(codeEditorPage.isEditorEditable()).isTrue();
    }

    @Entonces("el boton Copiar es visible")
    public void elBotonCopiarEsVisible() {
        assertThat(codeEditorPage.isCopyButtonVisible()).isTrue();
    }

    @Entonces("el boton Guardar como .ino es visible")
    public void elBotonGuardarComoInoEsVisible() {
        assertThat(codeEditorPage.isSaveInoButtonVisible()).isTrue();
    }

    @Entonces("el indicador de sincronizacion es visible")
    public void elIndicadorDeSincronizacionEsVisible() {
        assertThat(codeEditorPage.isSyncIndicatorVisible()).isTrue();
    }

    @Entonces("el estado de sincronizacion es {string}")
    public void elEstadoDeSincronizacionEs(String expectedStatus) {
        assertThat(codeEditorPage.getSyncStatus()).contains(expectedStatus);
    }
}
