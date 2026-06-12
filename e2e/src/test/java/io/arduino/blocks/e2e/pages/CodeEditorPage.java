package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.core.pages.WebElementFacade;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Monaco code editor.
 * Covers HU-06, HU-07, HU-09, HU-10, HU-12.
 */
public class CodeEditorPage extends PageObject {

    @FindBy(css = ".monaco-editor")
    private WebElementFacade monacoEditor;

    // ── Actions ──────────────────────────────────────────────────────────────

    @Step("Verificar que el editor Monaco es visible")
    public boolean isEditorVisible() {
        try {
            List<WebElement> editors = getDriver().findElements(By.cssSelector(".monaco-editor"));
            return !editors.isEmpty() && editors.get(0).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Obtener el contenido del editor Monaco")
    public String getEditorContent() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            Object result = js.executeScript("return monaco && monaco.editor && monaco.editor.getModels().length > 0 ? monaco.editor.getModels()[0].getValue() : null");
            return result != null ? result.toString() : "";
        } catch (Exception e) {
            return "";
        }
    }

    @Step("Verificar que el encabezado del archivo .ino es visible")
    public boolean isSketchHeaderVisible() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            String pageText = (String) js.executeScript("return document.body.innerText");
            return pageText != null && (pageText.contains("sketch.ino") || pageText.contains(".ino"));
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el codigo contiene '{0}'")
    public boolean codeContains(String text) {
        String content = waitForEditorContent();
        return content.contains(text);
    }

    /**
     * Monaco se carga de forma asincrona (muestra "Cargando editor..." mientras tanto),
     * por lo que getEditorContent() puede devolver vacio justo despues de abrir la app.
     * Reintenta hasta que el modelo tenga contenido o se agote el tiempo de espera.
     */
    private String waitForEditorContent() {
        long deadline = System.currentTimeMillis() + 15000;
        String content = getEditorContent();
        while (content.isEmpty() && System.currentTimeMillis() < deadline) {
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
            content = getEditorContent();
        }
        return content;
    }

    @Step("Verificar que el editor es editable")
    public boolean isEditorEditable() {
        try {
            List<WebElement> textareas = getDriver()
                    .findElements(By.cssSelector(".monaco-editor textarea, .monaco-editor [role='textbox']"));
            return !textareas.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el boton Copiar es visible")
    public boolean isCopyButtonVisible() {
        try {
            return !getDriver()
                    .findElements(By.cssSelector("[data-testid='copy-code-button']"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el boton Guardar como .ino es visible")
    public boolean isSaveInoButtonVisible() {
        try {
            return !getDriver()
                    .findElements(By.cssSelector("[data-testid='save-ino-button']"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el indicador de sincronizacion es visible")
    public boolean isSyncIndicatorVisible() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            String pageText = (String) js.executeScript("return document.body.innerText");
            return pageText != null && (pageText.contains("Sincronizado") || pageText.contains("sincroniz"));
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Obtener el estado de sincronizacion")
    public String getSyncStatus() {
        try {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            String pageText = (String) js.executeScript("return document.body.innerText");
            if (pageText != null && pageText.contains("Sincronizado")) {
                return "Sincronizado";
            }
            return "Desconocido";
        } catch (Exception e) {
            return "Error";
        }
    }
}
