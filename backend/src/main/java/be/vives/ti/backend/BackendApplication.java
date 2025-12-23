package be.vives.ti.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Collections;
import java.util.StringJoiner;

@SpringBootApplication
public class BackendApplication {
    private static final Logger log = LoggerFactory.getLogger(BackendApplication.class);

    static void main(String[] args) {
        log.info("Starting Gardening app Complete REST API...");

        SpringApplication app = new SpringApplication(BackendApplication.class);
        app.setDefaultProperties(Collections.singletonMap("spring.profiles.active", "dev"));

        ConfigurableApplicationContext ctx = app.run(args);

        String[] profiles = ctx.getEnvironment().getActiveProfiles();
        if (profiles == null || profiles.length == 0) {
            log.warn("No active profile set - defaulting to 'dev'");
        } else {
            StringJoiner joiner = new StringJoiner(", ");
            for (String p : profiles) joiner.add(p);
            log.info("Active profiles: {}", joiner);
        }

        log.info("Gardening app Complete REST API started successfully!");
    }

}
