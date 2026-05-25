package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.DefaultUrl;
import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.core.pages.WebElementFacade;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

/**
 * Page Object for the main Arduino Blocks IDE application.
 * Covers HU-01, HU-09, HU-17, HU-18.
 */
@DefaultUrl("http://localhost:3000")
public class AppPage extends PageObject {

    // AppBar elements
    @FindBy(xpath = "//h6[text()='Arduino']")
    private WebElementFacade arduinoHeading;

    @FindBy(xpath = "//button[@aria-label='Solo edicion bloques/codigo' or contains(@title,'Web')]")
    private WebElementFacade webIndicator;

    @FindBy(xpath = "//button[contains(@title,'Guardar codigo') or (contains(.,'Guardar') and not(contains(.,'como')))]")
    private WebElementFacade guardarButton;

    @FindBy(xpath = "//button[@aria-label='Configuracion' or @title='Configuracion' or @aria-label='Configuraci\u00f3n' or @title='Configuraci\u00f3n']")
    private WebElementFacade settingsButton;

    // Tabs — MUI Tab renders as <button role="tab">
    @FindBy(xpath = "//button[@role='tab' and contains(.,'Bloques')]")
    private WebElementFacade bloquesTab;

    @FindBy(xpath = "//button[@role='tab' and (contains(.,'Librerias') or contains(.,'Librer\u00edas'))]")
    private WebElementFacade libreriasTab;

    @FindBy(xpath = "//button[@role='tab' and contains(.,'Subir')]")
    private WebElementFacade subirTab;

    // ── Actions ──────────────────────────────────────────────────────────────

    @Step("El usuario abre la aplicacion Arduino Blocks")
    public void openApp() {
        openAt("http://localhost:3000");
        waitForPageReady();
    }

    @Step("Verificar que el encabezado '{0}' es visible")
    public boolean isHeadingVisible(String text) {
        try {
            return !getDriver()
                    .findElements(By.xpath("//h6[contains(text(),'" + text + "')] | //h5[contains(text(),'" + text + "')] | //h4[contains(text(),'" + text + "')]"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el texto '{0}' es visible")
    public boolean isTextVisible(String text) {
        try {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            String pageText = (String) js.executeScript("return document.body.innerText");
            return pageText != null && pageText.contains(text);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el indicador de modo Web es visible")
    public boolean isWebIndicatorVisible() {
        try {
            // The web indicator is a Typography element (p/span) showing "Web"
            return !getDriver()
                    .findElements(By.xpath("//*[normalize-space(text())='Web' and not(@role)]"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el boton Guardar esta visible")
    public boolean isGuardarButtonVisible() {
        try {
            WebElement btn = getDriver()
                    .findElement(By.xpath("//button[contains(@title,'Guardar codigo') or (contains(.,'Guardar') and not(contains(.,'como')))]"));
            return btn.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("El usuario hace clic en el boton Guardar")
    public void clickGuardar() {
        WebElement btn = getDriver()
                .findElement(By.xpath("//button[contains(@title,'Guardar codigo') or (contains(.,'Guardar') and not(contains(.,'como')))]"));
        btn.click();
    }

    @Step("Verificar que el boton Guardar tiene atributo de accesibilidad correcto")
    public boolean guardarButtonHasAccessibilityLabel() {
        try {
            WebElement btn = getDriver()
                    .findElement(By.xpath("//button[contains(@title,'Guardar codigo') or (contains(.,'Guardar') and not(contains(.,'como')))]"));
            String title = btn.getAttribute("title");
            String ariaLabel = btn.getAttribute("aria-label");
            return (title != null && !title.isEmpty()) || (ariaLabel != null && !ariaLabel.isEmpty());
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el boton de configuracion esta visible")
    public boolean isSettingsButtonVisible() {
        try {
            return !getDriver()
                    .findElements(By.xpath("//button[@aria-label='Configuraci\u00f3n' or @title='Configuraci\u00f3n' or @aria-label='Configuracion' or @title='Configuracion']"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("El usuario hace clic en el boton de configuracion")
    public void clickSettings() {
        WebElement btn = getDriver()
                .findElement(By.xpath("//button[@aria-label='Configuraci\u00f3n' or @title='Configuraci\u00f3n' or @aria-label='Configuracion' or @title='Configuracion']"));
        btn.click();
        waitABit(500);
    }

    @Step("El usuario navega a la pestana '{0}'")
    public void clickTab(String tabLabel) {
        WebElement tab = getDriver()
                .findElement(By.xpath("//button[@role='tab' and contains(.,'" + tabLabel + "')]"));
        tab.click();
        waitABit(500);
    }

    @Step("Verificar que la pestana '{0}' esta seleccionada")
    public boolean isTabSelected(String tabLabel) {
        try {
            WebElement tab = getDriver()
                    .findElement(By.xpath("//button[@role='tab' and contains(.,'" + tabLabel + "')]"));
            String ariaSelected = tab.getAttribute("aria-selected");
            return "true".equals(ariaSelected);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el panel de la pestana '{0}' es visible")
    public boolean isTabPanelVisible(String tabLabel) {
        try {
            // App.jsx uses conditional rendering (no tabpanel role) — verify the tab is selected
            waitABit(300);
            return isTabSelected(tabLabel);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Esperar que la snackbar sea visible")
    public boolean isSnackbarVisible() {
        try {
            return !getDriver()
                    .findElements(By.xpath("//div[contains(@class,'MuiSnackbar') or @role='alert']"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private void waitForPageReady() {
        waitFor(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h6[text()='Arduino']")));
        waitABit(1500);
    }
}
