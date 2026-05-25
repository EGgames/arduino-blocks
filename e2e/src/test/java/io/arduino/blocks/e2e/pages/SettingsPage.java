package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.core.pages.WebElementFacade;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Settings dialog.
 * Covers HU-08, HU-16, HU-17.
 */
public class SettingsPage extends PageObject {

    @FindBy(css = "div[role='dialog']")
    private WebElementFacade settingsDialog;

    // ── Actions ──────────────────────────────────────────────────────────────

    @Step("Verificar que el dialogo de configuracion esta visible")
    public boolean isDialogVisible() {
        try {
            // SettingsDialog is a Drawer (not a Dialog) — look for MuiDrawer-paper
            waitFor(org.openqa.selenium.support.ui.ExpectedConditions
                    .visibilityOfElementLocated(By.cssSelector("[class*='MuiDrawer-paper']")))
            ;
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el control de tamano de fuente esta visible")
    public boolean isFontSizeControlVisible() {
        try {
            List<WebElement> sliders = getDriver()
                    .findElements(By.cssSelector("input[type='range'], [role='slider']"));
            return !sliders.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que la etiqueta de tamano de fuente esta visible")
    public boolean isFontSizeLabelVisible() {
        try {
            List<WebElement> labels = getDriver()
                    .findElements(By.xpath("//*[contains(text(),'fuente') or contains(text(),'Fuente') or contains(text(),'font') or contains(text(),'Font')]"));
            return !labels.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Cerrar el dialogo de configuracion")
    public void closeDialog() {
        try {
            // Try clicking close button
            List<WebElement> closeBtns = getDriver()
                    .findElements(By.xpath("//button[@aria-label='close' or @aria-label='Close' or @aria-label='Cerrar' or contains(@class,'close')]"));
            if (!closeBtns.isEmpty()) {
                closeBtns.get(0).click();
            } else {
                // Click outside dialog
                WebElement overlay = getDriver().findElement(By.cssSelector(".MuiBackdrop-root, [class*='backdrop']"));
                overlay.click();
            }
            waitABit(300);
        } catch (Exception e) {
            // Dialog might already be closed
        }
    }

    @Step("Verificar que el dialogo de configuracion no esta visible")
    public boolean isDialogClosed() {
        try {
            List<WebElement> drawers = getDriver().findElements(By.cssSelector("[class*='MuiDrawer-paper']"));
            return drawers.isEmpty() || !drawers.get(0).isDisplayed();
        } catch (Exception e) {
            return true;
        }
    }

    @Step("Verificar que el mensaje COM del modo web esta visible")
    public boolean isComWebMessageVisible() {
        try {
            List<WebElement> msgs = getDriver()
                    .findElements(By.xpath("//*[contains(text(),'Web') or contains(text(),'COM') or contains(text(),'modo')]"));
            return !msgs.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que la seccion de placa esta visible")
    public boolean isBoardSectionVisible() {
        try {
            List<WebElement> sections = getDriver()
                    .findElements(By.xpath("//*[contains(text(),'Placa') or contains(text(),'placa') or contains(text(),'Board') or contains(text(),'board')]"));
            return !sections.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el boton de tema '{0}' es visible")
    public boolean isThemeButtonVisible(String themeName) {
        try {
            List<WebElement> btns = getDriver()
                    .findElements(By.xpath("//button[contains(.,'" + themeName + "')]"));
            return !btns.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Hacer clic en el boton de tema '{0}'")
    public void clickThemeButton(String themeName) {
        WebElement btn = getDriver()
                .findElement(By.xpath("//button[contains(.,'" + themeName + "')]"));
        btn.click();
        waitABit(300);
    }
}
