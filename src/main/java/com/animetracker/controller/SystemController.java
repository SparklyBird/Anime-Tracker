package com.animetracker.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private static final Logger log = LoggerFactory.getLogger(SystemController.class);

    private final ConfigurableApplicationContext context;

    @PostMapping("/shutdown")
    public ResponseEntity<Void> shutdown() {
        log.info("POST /api/system/shutdown - shutting down application");
        new Thread(() -> {
            try {
                Thread.sleep(300);
            } catch (InterruptedException ignored) {
            }
            System.exit(SpringApplication.exit(context, () -> 0));
        }).start();
        return ResponseEntity.ok().build();
    }
}