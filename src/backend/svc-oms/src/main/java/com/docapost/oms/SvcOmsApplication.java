package com.docapost.oms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * BC-05 — Intégration SI / OMS
 *
 * Responsabilités :
 * - Event Store append-only (US-018) : historisation immuable de chaque événement de livraison.
 * - Synchronisation OMS (US-017) : transmision < 30s vers l'API REST externe avec rejeu outbox.
 *
 * Port : 8083
 */
@SpringBootApplication
@EnableScheduling
public class SvcOmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SvcOmsApplication.class, args);
    }
}
