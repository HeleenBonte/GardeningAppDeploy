package be.vives.ti.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    private static final Logger log = LoggerFactory.getLogger(BackendApplication.class);

	static void main(String[] args) {
        log.info("Starting Gardening app Complete REST API...");
		SpringApplication.run(BackendApplication.class, args);
        log.info("Gardening app Complete REST API started successfully!");
	}

}
