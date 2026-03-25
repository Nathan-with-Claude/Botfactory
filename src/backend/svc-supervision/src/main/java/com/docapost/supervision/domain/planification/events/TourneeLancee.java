package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * TourneeLancee — Domain Event BC-07
 *
 * Émis quand une tournée affectée est lancée (US-024).
 * Déclenche BC-01 (Orchestration) qui crée la tournée dans l'app mobile du livreur.
 *
 * Dans le MVP : consommé par le DevDataSeeder de svc-tournee (simulation).
 * En production : publié sur le bus d'événements (Kafka) et consommé par svc-tournee.
 *
 * Source : US-024
 */
public record TourneeLancee(
        String tourneePlanifieeId,
        String codeTms,
        String livreurId,
        String livreurNom,
        String superviseurId,
        Instant lanceeLe
) {}
