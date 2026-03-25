package com.docapost.supervision.interfaces.planification.dto;

/**
 * AffecterRequest — DTO d'entrée pour l'affectation d'un livreur et d'un véhicule (US-023)
 *
 * Source : US-023
 */
public record AffecterRequest(
        String livreurId,
        String livreurNom,
        String vehiculeId
) {}
