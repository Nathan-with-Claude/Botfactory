package com.docapost.supervision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entrée — svc-supervision (BC-03 Supervision)
 *
 * US-011 : Tableau de bord des tournées en temps réel
 * US-012 : Détail d'une tournée superviseur
 * US-013 : Alerte tournée à risque (scheduler @EnableScheduling)
 */
@SpringBootApplication
@EnableScheduling
public class SvcSupervisionApplication {

    public static void main(String[] args) {
        SpringApplication.run(SvcSupervisionApplication.class, args);
    }
}
