package io.arduino.blocks.e2e.steps;

import io.arduino.blocks.e2e.pages.FeaturesPage;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Entonces;
import io.cucumber.java.es.Y;
import net.serenitybdd.annotations.Steps;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Definiciones de pasos para HU-19 a HU-27: compilación, archivos, temas,
 * redimensionado y bloques personalizados.
 */
public class FeaturesStepDefinitions {

    @Steps
    FeaturesPage featuresPage;

    private int anchoAnterior;

    // ── Botones genéricos ────────────────────────────────────────────────────

    @Entonces("el boton {string} es visible")
    public void elBotonEsVisible(String texto) {
        assertThat(featuresPage.isButtonVisible(texto)).as("boton %s", texto).isTrue();
    }

    @Entonces("el boton {string} esta deshabilitado")
    public void elBotonEstaDeshabilitado(String texto) {
        assertThat(featuresPage.isButtonDisabled(texto)).as("boton %s deshabilitado", texto).isTrue();
    }

    @Cuando("el usuario hace clic en el boton {string}")
    public void elUsuarioHaceClicEnElBoton(String texto) {
        featuresPage.clickButton(texto);
    }

    // ── Temas ────────────────────────────────────────────────────────────────

    @Entonces("el tema activo de la aplicacion es {string}")
    public void elTemaActivoEs(String tema) {
        assertThat(featuresPage.waitForTheme(tema)).as("tema %s", tema).isTrue();
    }

    @Entonces("el workspace de Blockly usa un fondo propio del tema")
    public void elWorkspaceUsaFondoDelTema() {
        assertThat(featuresPage.blocklyBackgroundColour()).isNotEmpty();
    }

    @Entonces("el panel de librerias usa un fondo propio del tema")
    public void elPanelDeLibreriasUsaFondoDelTema() {
        assertThat(featuresPage.libraryPanelBackgroundColour()).isNotEmpty();
    }

    // ── Redimensionado ───────────────────────────────────────────────────────

    @Cuando("el usuario redimensiona la ventana a {int} por {int}")
    public void elUsuarioRedimensionaLaVentana(int ancho, int alto) {
        anchoAnterior = featuresPage.blocklyCanvasWidth();
        featuresPage.resizeWindow(ancho, alto);
    }

    @Entonces("el lienzo de Blockly se adapta al nuevo tamano")
    public void elLienzoSeAdapta() {
        int nuevo = featuresPage.blocklyCanvasWidth();
        assertThat(nuevo).isGreaterThan(0);
        assertThat(nuevo).isNotEqualTo(anchoAnterior);
    }

    // ── Bloques personalizados ───────────────────────────────────────────────

    @Cuando("el usuario crea el bloque personalizado {string} con el codigo {string}")
    public void elUsuarioCreaElBloquePersonalizado(String etiqueta, String codigo) {
        featuresPage.createCustomBlock(etiqueta, codigo);
    }

    @Entonces("la lista de bloques personalizados contiene {string}")
    public void laListaDeBloquesPersonalizadosContiene(String etiqueta) {
        assertThat(featuresPage.hasCustomBlock(etiqueta)).as("bloque %s", etiqueta).isTrue();
    }

    @Cuando("el usuario inserta el bloque personalizado en el workspace")
    public void elUsuarioInsertaElBloquePersonalizado() {
        anchoAnterior = featuresPage.workspaceBlockCount();
        featuresPage.insertFirstCustomBlock();
    }

    @Y("el workspace tiene mas bloques que antes")
    public void elWorkspaceTieneMasBloques() {
        assertThat(featuresPage.workspaceBlockCount()).isGreaterThan(anchoAnterior);
    }
}
