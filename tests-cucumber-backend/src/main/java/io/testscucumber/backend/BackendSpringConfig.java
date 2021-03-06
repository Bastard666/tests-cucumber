package io.testscucumber.backend;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dropwizard.setup.Environment;
import io.testscucumber.backend.support.morphia.MorphiaDatastoreBuilder;
import org.mongodb.morphia.Datastore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackageClasses = BackendSpringConfig.class)
public class BackendSpringConfig {

    @Autowired
    private BackendConfiguration configuration;

    @Autowired
    private Environment dropwizardEnvironment;

    @Bean
    public Datastore datastore() {
        return new MorphiaDatastoreBuilder(dropwizardEnvironment)
            .withUri(configuration.getMongoUri())
            .build("mongo");
    }

    @Bean
    public ObjectMapper reportObjectMapper() {
        return dropwizardEnvironment.getObjectMapper()
            .copy()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    }

}
