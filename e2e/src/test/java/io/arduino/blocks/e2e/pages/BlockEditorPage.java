package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.core.pages.WebElementFacade;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Blockly block editor.
 * Covers HU-01, HU-02, HU-03, HU-04, HU-05.
 */
public class BlockEditorPage extends PageObject {

    @FindBy(xpath = "//*[@aria-label='Blockly Workspace']")
    private WebElementFacade blocklyWorkspace;

    @FindBy(xpath = "//div[@role='tree']")
    private WebElementFacade toolbox;

    // ── Actions ──────────────────────────────────────────────────────────────

    @Step("Verificar que el espacio de trabajo Blockly es visible")
    public boolean isWorkspaceVisible() {
        try {
            WebElement workspace = getDriver()
                    .findElement(By.xpath("//*[@aria-label='Blockly Workspace']"));
            return workspace.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el espacio de trabajo Blockly esta habilitado para interaccion")
    public boolean isWorkspaceInteractive() {
        try {
            List<WebElement> svgElements = getDriver()
                    .findElements(By.cssSelector("svg.blocklySvg, [aria-label='Blockly Workspace'] svg, [aria-label='Blockly Workspace'] img"));
            return !svgElements.isEmpty() || isWorkspaceVisible();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que la caja de herramientas es visible")
    public boolean isToolboxVisible() {
        try {
            List<WebElement> items = getDriver()
                    .findElements(By.xpath("//div[@role='treeitem']"));
            return !items.isEmpty() && items.get(0).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que la categoria '{0}' esta en la caja de herramientas")
    public boolean hasCategoryInToolbox(String categoryName) {
        try {
            List<WebElement> items = getDriver()
                    .findElements(By.xpath("//div[@role='treeitem' and contains(.,'" + categoryName + "')]"));
            return items.stream().anyMatch(WebElement::isDisplayed);
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que el bloque '{0}' es visible en el workspace")
    public boolean isBlockVisible(String blockText) {
        try {
            List<WebElement> blocks = getDriver()
                    .findElements(By.xpath("//*[contains(text(),'" + blockText + "')]"));
            return blocks.stream().anyMatch(WebElement::isDisplayed);
        } catch (Exception e) {
            return false;
        }
    }
}
