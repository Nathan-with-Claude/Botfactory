package com.docapost.tournee.domain.preuves.model;

/**
 * Value Object (enum) — Type de preuve de livraison.
 *
 * Quatre types couverts par le MVP :
 * - SIGNATURE      : pad tactile numérique (US-008)
 * - PHOTO          : photo du colis déposé (US-009)
 * - TIERS_IDENTIFIE: dépôt chez un tiers nommé (US-009)
 * - DEPOT_SECURISE : description du lieu de dépôt sécurisé (US-009)
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves.
 */
public enum TypePreuve {
    SIGNATURE,
    PHOTO,
    TIERS_IDENTIFIE,
    DEPOT_SECURISE
}
