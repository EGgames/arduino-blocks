package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.pages.PageObject;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object transversal para las funcionalidades que no tienen un panel propio:
 * compilación/subida en modo web, temas, redimensionado y bloques personalizados.
 * Cubre HU-19 a HU-27.
 */
public class FeaturesPage extends PageObject {

    private JavascriptExecutor js() {
        return (JavascriptExecutor) getDriver();
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Botones de accion con ese texto. Se excluyen las pestanas, que en MUI
     * tambien son elementos &lt;button&gt; y pueden compartir la etiqueta
     * (por ejemplo la pestana "Subir" y el boton "Subir" del panel de carga).
     */
    private List<WebElement> buttonsWithText(String text) {
        return getDriver().findElements(By.xpath(
                "//button[not(@role='tab') and contains(normalize-space(.), '" + text + "')]"));
    }

    private WebElement buttonWithText(String text) {
        return buttonsWithText(text).get(0);
    }

    // ── HU-19 / HU-20 / HU-21: acciones de archivo y compilación ─────────────

    @Step("Verificar que el boton '{0}' es visible")
    public boolean isButtonVisible(String text) {
        try {
            return buttonsWithText(text).stream().anyMatch(WebElement::isDisplayed);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el boton '{0}' esta deshabilitado")
    public boolean isButtonDisabled(String text) {
        try {
            List<WebElement> botones = buttonsWithText(text);
            return !botones.isEmpty() && botones.stream().noneMatch(WebElement::isEnabled);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Hacer clic en el boton '{0}'")
    public void clickButton(String text) {
        try {
            buttonWithText(text).click();
            sleep(400);
        } catch (Exception e) {
            // Los escenarios comprueban el efecto por separado
        }
    }

    // ── HU-22 / HU-23 / HU-24: temas ────────────────────────────────────────

    @Step("Obtener el tema activo del documento")
    public String activeTheme() {
        try {
            Object t = js().executeScript("return document.documentElement.getAttribute('data-theme')");
            return t == null ? "" : t.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @Step("Esperar a que el tema activo sea '{0}'")
    public boolean waitForTheme(String expected) {
        long deadline = System.currentTimeMillis() + 10000;
        while (System.currentTimeMillis() < deadline) {
            if (expected.equals(activeTheme())) return true;
            sleep(300);
        }
        return false;
    }

    @Step("Obtener el color de fondo del workspace de Blockly")
    public String blocklyBackgroundColour() {
        try {
            Object c = js().executeScript(
                    "const el = document.querySelector('.blocklyMainBackground');" +
                    "return el ? window.getComputedStyle(el).fill : '';");
            return c == null ? "" : c.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @Step("Obtener el color de fondo del panel de librerias")
    public String libraryPanelBackgroundColour() {
        try {
            Object c = js().executeScript(
                    "const el = document.querySelector('[data-testid=\"library-counter\"]');" +
                    "if (!el) return '';" +
                    "const panel = el.parentElement;" +
                    "return panel ? window.getComputedStyle(panel).backgroundColor : '';");
            return c == null ? "" : c.toString();
        } catch (Exception e) {
            return "";
        }
    }

    // ── HU-25: redimensionado ────────────────────────────────────────────────

    @Step("Cambiar el tamano de la ventana a {0}x{1}")
    public void resizeWindow(int width, int height) {
        getDriver().manage().window().setSize(new Dimension(width, height));
        sleep(1000);
    }

    @Step("Obtener el ancho del lienzo de Blockly")
    public int blocklyCanvasWidth() {
        try {
            Object w = js().executeScript(
                    "const svg = document.querySelector('svg.blocklySvg');" +
                    "return svg ? Math.round(svg.getBoundingClientRect().width) : 0;");
            return w == null ? 0 : ((Number) w).intValue();
        } catch (Exception e) {
            return 0;
        }
    }

    // ── HU-26 / HU-27: bloques personalizados ───────────────────────────────

    @Step("Crear el bloque personalizado '{0}' con el codigo '{1}'")
    public void createCustomBlock(String label, String code) {
        fillTextField("Nombre del bloque", label);
        fillTextField("Código C++ generado", code);
        clickButton("Crear bloque");
        sleep(600);
    }

    private void fillTextField(String label, String value) {
        try {
            WebElement input = getDriver().findElement(By.xpath(
                    "//label[contains(., '" + label + "')]/following::*[self::input or self::textarea][1]"));
            input.clear();
            input.sendKeys(value);
        } catch (Exception e) {
            // El escenario falla luego con un mensaje claro
        }
    }

    @Step("Verificar que la lista de bloques personalizados contiene '{0}'")
    public boolean hasCustomBlock(String label) {
        try {
            List<WebElement> items = getDriver()
                    .findElements(By.xpath("//*[normalize-space(text())='" + label + "']"));
            return items.stream().anyMatch(WebElement::isDisplayed);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Insertar el primer bloque personalizado en el workspace")
    public void insertFirstCustomBlock() {
        try {
            WebElement boton = getDriver().findElement(
                    By.xpath("//button[@aria-label='Insertar en workspace' or contains(@title,'Insertar')]"));
            boton.click();
        } catch (Exception e) {
            // Fallback: el boton se identifica por su icono de reproducir
            try {
                getDriver().findElement(By.cssSelector("[data-testid='PlayArrowIcon']")).click();
            } catch (Exception ignored) {
                // sin efecto
            }
        }
        sleep(800);
    }

    @Step("Contar los bloques totales del workspace")
    public int workspaceBlockCount() {
        try {
            Object n = js().executeScript(
                    "const ws = window.__blocklyWorkspace;" +
                    "return ws ? ws.getAllBlocks(false).length : 0;");
            return n == null ? 0 : ((Number) n).intValue();
        } catch (Exception e) {
            return 0;
        }
    }
}
