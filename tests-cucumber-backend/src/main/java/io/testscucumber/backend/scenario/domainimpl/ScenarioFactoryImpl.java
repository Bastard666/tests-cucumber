package io.testscucumber.backend.scenario.domainimpl;

import io.testscucumber.backend.scenario.domain.Scenario;
import io.testscucumber.backend.scenario.domain.ScenarioFactory;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.UUID;

@Component
class ScenarioFactoryImpl implements ScenarioFactory {

    @Override
    public Scenario create(final String testRunId, final String featureId) {
        final Scenario scenario = new Scenario();
        scenario.setId(UUID.randomUUID().toString());
        scenario.setTestRunId(testRunId);
        scenario.setFeatureId(featureId);

        final ZonedDateTime now = ZonedDateTime.now();
        scenario.setCreatedAt(now);
        scenario.setModifiedAt(now);

        return scenario;
    }

}
