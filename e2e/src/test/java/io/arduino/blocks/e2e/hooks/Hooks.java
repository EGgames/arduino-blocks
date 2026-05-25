package io.arduino.blocks.e2e.hooks;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import net.serenitybdd.core.Serenity;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Cucumber hooks for Serenity E2E tests.
 */
public class Hooks {

    private static final Logger log = LoggerFactory.getLogger(Hooks.class);

    @Before
    public void beforeScenario(Scenario scenario) {
        log.info("Starting scenario: {}", scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        if (scenario.isFailed()) {
            log.warn("Scenario FAILED: {}", scenario.getName());
            try {
                WebDriver driver = Serenity.getDriver();
                if (driver != null) {
                    byte[] screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
                    if (screenshot != null && screenshot.length > 0) {
                        scenario.attach(screenshot, "image/png", "screenshot-on-failure");
                    }
                }
            } catch (Exception e) {
                log.debug("Could not attach screenshot: {}", e.getMessage());
            }
        }
        log.info("Finished scenario: {} — {}", scenario.getName(), scenario.getStatus());
    }
}
