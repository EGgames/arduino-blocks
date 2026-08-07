package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.pages.PageObject;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object para el espacio de trabajo de bloques y su sincronizacion con el
 * editor de codigo (funcionalidad de la version 1.3).
 *
 * Se apoya en dos puntos de integracion reales de la aplicacion:
 *   - el modelo de Monaco, que dispara el flujo codigo → bloques
 *   - window.__blocklyWorkspace, que la app expone para inspeccion
 */
public class WorkspacePage extends PageObject {

    private static final long TIMEOUT_MS = 20000;

    private JavascriptExecutor js() {
        return (JavascriptExecutor) getDriver();
    }

    // ── Edicion de codigo ────────────────────────────────────────────────────

    @Step("Escribir el sketch en el editor de codigo")
    public void writeCode(String code) {
        js().executeScript(
                "const m = window.monaco && window.monaco.editor.getModels()[0];" +
                "if (m) { m.setValue(arguments[0]); }", code);
    }

    @Step("Esperar a que la sincronizacion termine")
    public void waitForSync() {
        long deadline = System.currentTimeMillis() + TIMEOUT_MS;
        while (System.currentTimeMillis() < deadline) {
            String estado = syncStatusText();
            if (estado.contains("Sincronizado") || estado.contains("Error")) return;
            sleep(300);
        }
    }

    @Step("Obtener el estado de sincronizacion")
    public String syncStatusText() {
        try {
            Object txt = js().executeScript("return document.body.innerText");
            return txt == null ? "" : txt.toString();
        } catch (Exception e) {
            return "";
        }
    }

    // ── Inspeccion del workspace de bloques ──────────────────────────────────

    @Step("Contar bloques del tipo '{0}' en el workspace")
    public int countBlocksOfType(String type) {
        long deadline = System.currentTimeMillis() + TIMEOUT_MS;
        int total = readCount(type);
        while (total == 0 && System.currentTimeMillis() < deadline) {
            sleep(400);
            total = readCount(type);
        }
        return total;
    }

    private int readCount(String type) {
        try {
            Object n = js().executeScript(
                    "const ws = window.__blocklyWorkspace;" +
                    "if (!ws) return -1;" +
                    "try { return ws.getBlocksByType(arguments[0], false).length; } catch (e) { return -1; }",
                    type);
            return n == null ? -1 : ((Number) n).intValue();
        } catch (Exception e) {
            return -1;
        }
    }

    @Step("Obtener el nombre de la variable usada en el bloque '{0}'")
    public String fieldValueOfFirstBlock(String type, String fieldName) {
        try {
            Object v = js().executeScript(
                    "const ws = window.__blocklyWorkspace;" +
                    "if (!ws) return null;" +
                    "const b = ws.getBlocksByType(arguments[0], false)[0];" +
                    "return b ? b.getFieldValue(arguments[1]) : null;",
                    type, fieldName);
            return v == null ? "" : v.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @Step("Verificar que el bloque '{0}' tiene un bloque conectado en la entrada '{1}'")
    public String connectedBlockType(String type, String inputName) {
        try {
            Object v = js().executeScript(
                    "const ws = window.__blocklyWorkspace;" +
                    "if (!ws) return null;" +
                    "const b = ws.getBlocksByType(arguments[0], false)[0];" +
                    "if (!b) return null;" +
                    "const t = b.getInputTargetBlock(arguments[1]);" +
                    "return t ? t.type : null;",
                    type, inputName);
            return v == null ? "" : v.toString();
        } catch (Exception e) {
            return "";
        }
    }

    // ── Caja de herramientas ─────────────────────────────────────────────────

    @Step("Contar las categorias de la caja de herramientas")
    public int countToolboxCategories() {
        try {
            List<WebElement> items = getDriver().findElements(By.cssSelector("[role='treeitem']"));
            return items.size();
        } catch (Exception e) {
            return 0;
        }
    }

    @Step("Esperar a que la categoria '{0}' aparezca en la caja de herramientas")
    public boolean waitForToolboxCategory(String name) {
        long deadline = System.currentTimeMillis() + TIMEOUT_MS;
        while (System.currentTimeMillis() < deadline) {
            if (hasToolboxCategory(name)) return true;
            sleep(400);
        }
        return false;
    }

    @Step("Verificar que la categoria '{0}' esta en la caja de herramientas")
    public boolean hasToolboxCategory(String name) {
        try {
            List<WebElement> items = getDriver()
                    .findElements(By.xpath("//div[@role='treeitem' and contains(., '" + name + "')]"));
            return items.stream().anyMatch(WebElement::isDisplayed);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Abrir la categoria '{0}' de la caja de herramientas")
    public void openToolboxCategory(String name) {
        // La categoria puede aparecer con retraso: el toolbox se reconstruye cuando
        // la sincronizacion detecta los #include del sketch.
        waitForToolboxCategory(name);
        try {
            WebElement item = getDriver()
                    .findElement(By.xpath("//div[@role='treeitem' and contains(., '" + name + "')]"));
            item.click();
            sleep(800);
        } catch (Exception e) {
            // La categoria no existe: los escenarios lo comprueban por separado
        }
    }

    @Step("Contar los bloques mostrados en el desplegable de la categoria")
    public int countFlyoutBlocks() {
        long deadline = System.currentTimeMillis() + TIMEOUT_MS;
        int total = readFlyoutBlocks();
        while (total == 0 && System.currentTimeMillis() < deadline) {
            sleep(400);
            total = readFlyoutBlocks();
        }
        return total;
    }

    private int readFlyoutBlocks() {
        try {
            Object n = js().executeScript(
                    "const flyouts = document.querySelectorAll('.blocklyFlyout');" +
                    "let total = 0;" +
                    "flyouts.forEach((f) => {" +
                    "  if (f.style && f.style.display === 'none') return;" +
                    "  total += f.querySelectorAll('g.blocklyDraggable').length;" +
                    "});" +
                    "return total;");
            return n == null ? 0 : ((Number) n).intValue();
        } catch (Exception e) {
            return 0;
        }
    }

    // ── Utilidades ───────────────────────────────────────────────────────────

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
