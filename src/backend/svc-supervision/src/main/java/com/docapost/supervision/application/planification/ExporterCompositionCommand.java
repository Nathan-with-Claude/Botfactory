package com.docapost.supervision.application.planification;

/**
 * ExporterCompositionCommand — Commande Application Layer BC-07
 *
 * Déclenche la traçabilité d'un export CSV de la composition d'une TourneePlanifiee.
 * L'opération est une lecture pure : aucune modification d'état sur la tournée.
 * Seul le Domain Event CompositionExportee est émis pour traçabilité.
 *
 * Source : US-028
 */
public record ExporterCompositionCommand(
        String tourneePlanifieeId,
        String superviseurId
) {}
