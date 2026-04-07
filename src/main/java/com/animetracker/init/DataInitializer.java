package com.animetracker.init;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void run(String... args) throws Exception {
        Files.createDirectories(Paths.get(uploadDir));
        log.info("Upload directory ready: {}", Paths.get(uploadDir).toAbsolutePath());
        log.info("Anime Tracker started — open http://localhost:8080");
    }
}
