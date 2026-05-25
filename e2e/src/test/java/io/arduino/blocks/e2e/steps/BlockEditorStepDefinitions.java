package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.BlockEditorPage;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

public class BlockEditorStepDefinitions {

    @Steps
    BlockEditorPage blockEditorPage;

    @Entonces("el espacio de trabajo Blockly es visible")
    public void elEspacioDeTrabajoBlocklyEsVisible() {
        assertThat(blockEditorPage.isWorkspaceVisible()).isTrue();
    }

    @Entonces("el espacio de trabajo Blockly esta habilitado para interaccion")
    public void elEspacioDeTrabajoBlocklyEstaHabilitado() {
        assertThat(blockEditorPage.isWorkspaceInteractive()).isTrue();
    }

    @Entonces("la caja de herramientas es visible")
    public void laCajaDeHerramientasEsVisible() {
        assertThat(blockEditorPage.isToolboxVisible()).isTrue();
    }

    @Entonces("la caja de herramientas contiene la categoria {string}")
    public void laCajaDeHerramientasContieneCategoria(String categoryName) {
        assertThat(blockEditorPage.hasCategoryInToolbox(categoryName)).isTrue();
    }

    @Entonces("el bloque {string} es visible en el workspace")
    public void elBloqueEsVisibleEnElWorkspace(String blockText) {
        assertThat(blockEditorPage.isBlockVisible(blockText)).isTrue();
    }
}
