package io.arduino.blocks.e2e.pages;

import net.serenitybdd.annotations.Step;
import net.serenitybdd.core.annotations.findby.FindBy;
import net.serenitybdd.core.pages.PageObject;
import net.serenitybdd.core.pages.WebElementFacade;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Page Object for the Library Panel.
 * Covers HU-13, HU-14, HU-15.
 */
public class LibraryPanelPage extends PageObject {

    @FindBy(css = "[data-testid='library-counter']")
    private WebElementFacade libraryCounter;

    @FindBy(css = "input[placeholder*='Buscar'], input[placeholder*='buscar']")
    private WebElementFacade searchInput;

    // ── Actions ──────────────────────────────────────────────────────────────

    @Step("Verificar que el panel de librerias es visible")
    public boolean isPanelVisible() {
        try {
            List<WebElement> panels = getDriver()
                    .findElements(By.cssSelector("[data-testid='library-counter'], .library-panel, [class*='library']"));
            return !panels.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Obtener el numero de librerias disponibles")
    public int getLibraryCount() {
        try {
            WebElement counter = getDriver()
                    .findElement(By.cssSelector("[data-testid='library-counter']"));
            String text = counter.getText();
            String digits = text.replaceAll("[^0-9]", "");
            return digits.isEmpty() ? 0 : Integer.parseInt(digits);
        } catch (Exception e) {
            return 0;
        }
    }

    @Step("Verificar que la categoria de libreria '{0}' existe")
    public boolean hasCategoryChip(String categoryName) {
        try {
            // MUI Chip with clickable renders as <div role="button">, not a <button> tag
            List<WebElement> chips = getDriver()
                    .findElements(By.xpath("//*[contains(@class,'MuiChip') and contains(.,'" + categoryName + "')]"));
            return !chips.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Hacer clic en la categoria '{0}'")
    public void clickCategory(String categoryName) {
        WebElement chip = getDriver()
                .findElement(By.xpath("//button[normalize-space(.)='" + categoryName + "' or contains(.,'" + categoryName + "')]"));
        chip.click();
        waitABit(300);
    }

    @Step("Verificar que el filtro de busqueda es visible")
    public boolean isSearchFilterVisible() {
        try {
            return !getDriver()
                    .findElements(By.cssSelector("input[placeholder*='Buscar'], input[placeholder*='buscar'], input[placeholder*='Search']"))
                    .isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Buscar libreria '{0}'")
    public void searchLibrary(String term) {
        WebElement input = getDriver()
                .findElement(By.cssSelector("input[placeholder*='Buscar'], input[placeholder*='buscar'], input[placeholder*='Search']"));
        input.clear();
        input.sendKeys(term);
        waitABit(500);
    }

    @Step("Contar resultados de busqueda de librerias")
    public int getSearchResultCount() {
        try {
            waitABit(400);
            // Count visible library item buttons that contain "Agregar"
            List<WebElement> results = getDriver()
                    .findElements(By.xpath("//button[contains(@aria-label,'Agregar') or contains(.,'#include')]"));
            return (int) results.stream().filter(WebElement::isDisplayed).count();
        } catch (Exception e) {
            return 0;
        }
    }

    @Step("Verificar que el mensaje sin resultados es visible")
    public boolean isNoResultsMessageVisible() {
        try {
            List<WebElement> msgs = getDriver()
                    .findElements(By.xpath("//*[contains(text(),'no se encontraron') or contains(text(),'No se encontraron') or contains(text(),'sin resultados') or contains(text(),'0 librer')]"));
            return !msgs.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Agregar libreria '{0}'")
    public void addLibrary(String libraryName) {
        // Use data-testid added to LibraryPanel ListItemButton for reliable headless click
        String testId = "library-item-" + libraryName;
        List<WebElement> items = getDriver()
                .findElements(By.cssSelector("[data-testid='" + testId + "']:not(.Mui-disabled)"));
        if (items.isEmpty()) {
            // Fallback: search first to bring item into view, then retry
            WebElement input = getDriver()
                    .findElement(By.cssSelector("input[placeholder*='Buscar'], input[placeholder*='buscar']"));
            input.clear();
            input.sendKeys(libraryName);
            waitABit(600);
            items = getDriver()
                    .findElements(By.cssSelector("[data-testid='" + testId + "']:not(.Mui-disabled)"));
        }
        if (!items.isEmpty()) {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            js.executeScript("arguments[0].click()", items.get(0));
        }
        waitABit(800);
    }

    @Step("Limpiar el campo de busqueda")
    public void clearSearch() {
        WebElement input = getDriver()
                .findElement(By.cssSelector("input[placeholder*='Buscar'], input[placeholder*='buscar']"));
        input.clear();
        input.sendKeys(Keys.CONTROL, "a");
        input.sendKeys(Keys.DELETE);
        waitABit(300);
    }

    @Step("Verificar que la libreria '{0}' esta en la lista de resultados")
    public boolean containsLibrary(String libraryName) {
        try {
            waitABit(300);
            List<WebElement> items = getDriver()
                    .findElements(By.xpath("//*[contains(text(),'" + libraryName + "') and (contains(@class,'MuiListItem') or ancestor::*[contains(@class,'MuiList')])]"));
            if (!items.isEmpty()) return true;
            // Fallback: look for any element containing the library name
            List<WebElement> any = getDriver()
                    .findElements(By.xpath("//*[normalize-space(text())='" + libraryName + "']"));
            return !any.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    @Step("Verificar que la libreria '{0}' esta incluida en el proyecto")
    public boolean isLibraryIncluded(String libraryName) {
        try {
            // Wait for the list item to become disabled (React re-renders after Blockly event)
            waitFor(org.openqa.selenium.support.ui.ExpectedConditions
                    .attributeContains(
                        By.cssSelector("[data-testid='library-item-" + libraryName + "']"),
                        "class", "Mui-disabled"));
            return true;
        } catch (Exception e) {
            // Fallback: check Monaco editor for #include directive
            try {
                JavascriptExecutor js = (JavascriptExecutor) getDriver();
                Object result = js.executeScript("return typeof monaco !== 'undefined' && monaco.editor && monaco.editor.getModels().length > 0 ? monaco.editor.getModels()[0].getValue() : null");
                String code = result != null ? result.toString() : "";
                return code.contains("#include <" + libraryName + ".h>");
            } catch (Exception e2) {
                return false;
            }
        }
    }

    @Step("Filtrar librerias por categoria '{0}'")
    public void filterByCategory(String category) {
        try {
            WebElement chip = getDriver()
                    .findElement(By.xpath("//button[normalize-space(.)='" + category + "' or contains(.,'" + category + "')]"));
            chip.click();
            waitABit(400);
        } catch (Exception e) {
            // Try MUI Chip click
            List<WebElement> chips = getDriver()
                    .findElements(By.xpath("//*[contains(@class,'MuiChip') and contains(.,'" + category + "')]"));
            if (!chips.isEmpty()) chips.get(0).click();
            waitABit(400);
        }
    }
}
