package com.docapost.supervision.infrastructure.config;

import com.docapost.supervision.domain.service.RisqueDetector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Spring — svc-supervision (BC-03)
 *
 * Déclare les beans du domaine qui nécessitent des paramètres configurables.
 *
 * Source : US-013 — "Alerte tournée à risque"
 */
@Configuration
public class SupervisionConfig {

    /**
     * Seuil d'inactivité (en minutes) au-delà duquel une tournée est considérée à risque.
     * Par défaut : 30 minutes.
     * Configurable via supervision.risque.seuil-inactivite-min dans application.yml.
     */
    @Bean
    public RisqueDetector risqueDetector(
            @Value("${supervision.risque.seuil-inactivite-min:30}") int seuilInactiviteMin
    ) {
        return new RisqueDetector(seuilInactiviteMin);
    }
}
