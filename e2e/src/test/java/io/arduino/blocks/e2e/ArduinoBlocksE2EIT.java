package io.arduino.blocks.e2e;

import io.cucumber.junit.platform.engine.Constants;
import org.junit.platform.suite.api.*;

/**
 * Serenity BDD + Cucumber JUnit 5 Platform Suite runner.
 * Picked up by maven-failsafe-plugin (*IT.java pattern).
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(
        key = Constants.PLUGIN_PROPERTY_NAME,
        value = "io.cucumber.core.plugin.SerenityReporterParallel,pretty"
)
@ConfigurationParameter(
        key = Constants.GLUE_PROPERTY_NAME,
        value = "io.arduino.blocks.e2e.steps,io.arduino.blocks.e2e.hooks"
)
@ConfigurationParameter(
        key = Constants.FILTER_TAGS_PROPERTY_NAME,
        value = "not @ignore"
)
@ConfigurationParameter(
        key = Constants.EXECUTION_DRY_RUN_PROPERTY_NAME,
        value = "false"
)
public class ArduinoBlocksE2EIT {
}
