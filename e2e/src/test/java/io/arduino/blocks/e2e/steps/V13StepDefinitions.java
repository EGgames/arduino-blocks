package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.WorkspacePage;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Definiciones de pasos para las funcionalidades incorporadas en la version 1.3:
 * catalogo completo de bloques Arduino/C++, variables enchufables en cualquier
 * hueco de valor y traduccion de todas las librerias a bloques.
 */
public class V13StepDefinitions {

    @Steps
    WorkspacePage workspacePage;

    // ── Edicion de codigo ────────────────────────────────────────────────────

    @Cuando("el usuario escribe el sketch:")
    public void elUsuarioEscribeElSketch(String code) {
        workspacePage.writeCode(code);
        workspacePage.waitForSync();
    }

    @Entonces("la sincronizacion termina correctamente")
    public void laSincronizacionTerminaCorrectamente() {
        assertThat(workspacePage.syncStatusText()).contains("Sincronizado");
    }

    // ── Bloques del workspace ────────────────────────────────────────────────

    @Entonces("el workspace contiene al menos un bloque de tipo {string}")
    public void elWorkspaceContieneBloqueDeTipo(String type) {
        assertThat(workspacePage.countBlocksOfType(type))
                .as("bloques de tipo %s", type)
                .isGreaterThanOrEqualTo(1);
    }

    @Entonces("el bloque {string} tiene el campo {string} con valor {string}")
    public void elBloqueTieneElCampoConValor(String type, String field, String value) {
        assertThat(workspacePage.fieldValueOfFirstBlock(type, field)).isEqualTo(value);
    }

    @Entonces("el bloque {string} tiene conectado un bloque {string} en la entrada {string}")
    public void elBloqueTieneConectadoUnBloqueEnLaEntrada(String type, String expected, String input) {
        assertThat(workspacePage.connectedBlockType(type, input)).isEqualTo(expected);
    }

    // ── Caja de herramientas ─────────────────────────────────────────────────

    @Entonces("la caja de herramientas tiene al menos {int} categorias")
    public void laCajaDeHerramientasTieneAlMenosCategorias(int minimo) {
        assertThat(workspacePage.countToolboxCategories()).isGreaterThanOrEqualTo(minimo);
    }

    @Entonces("la caja de herramientas muestra la categoria {string}")
    public void laCajaDeHerramientasMuestraLaCategoria(String name) {
        assertThat(workspacePage.waitForToolboxCategory(name))
                .as("categoria %s en la caja de herramientas", name)
                .isTrue();
    }

    @Cuando("el usuario abre la categoria {string} de la caja de herramientas")
    public void elUsuarioAbreLaCategoria(String name) {
        workspacePage.openToolboxCategory(name);
    }

    @Entonces("el desplegable muestra al menos {int} bloques")
    public void elDesplegableMuestraAlMenosBloques(int minimo) {
        assertThat(workspacePage.countFlyoutBlocks()).isGreaterThanOrEqualTo(minimo);
    }

    @Y("la caja de herramientas no muestra la categoria {string}")
    public void laCajaDeHerramientasNoMuestraLaCategoria(String name) {
        assertThat(workspacePage.hasToolboxCategory(name)).isFalse();
    }
}
