package com.docapost.supervision.application.planification;

/**
 * AffecterLivreurVehiculeCommand — Command BC-07 (US-023)
 *
 * Commande atomique : livreur ET véhicule doivent être présents.
 * Source : US-023
 */
public record AffecterLivreurVehiculeCommand(
        String tourneePlanifieeId,
        String livreurId,
        String livreurNom,
        String vehiculeId,
        String superviseurId
) {}
