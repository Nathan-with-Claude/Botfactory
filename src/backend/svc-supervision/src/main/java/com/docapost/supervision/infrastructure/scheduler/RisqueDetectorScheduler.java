package com.docapost.supervision.infrastructure.scheduler;

import com.docapost.supervision.application.DetecterTourneesARisqueHandler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler — RisqueDetectorScheduler (BC-03 Supervision — US-013)
 *
 * Déclenche la détection des tournées à risque toutes les minutes.
 * L'intervalle garantit que toute anomalie est détectée en < 15 minutes
 * après son apparition (exigence US-013 : < 15 min).
 *
 * Source : US-013 — "Alerte tournée à risque"
 */
@Component
public class RisqueDetectorScheduler {

    private final DetecterTourneesARisqueHandler handler;

    public RisqueDetectorScheduler(DetecterTourneesARisqueHandler handler) {
        this.handler = handler;
    }

    /**
     * Exécuté toutes les 60 secondes.
     * La détection est délayée de 60 secondes au démarrage (initialDelay)
     * pour laisser le DevDataSeeder se terminer.
     */
    @Scheduled(fixedDelay = 60_000, initialDelay = 60_000)
    public void detecterTourneesARisque() {
        handler.detecter();
    }
}
