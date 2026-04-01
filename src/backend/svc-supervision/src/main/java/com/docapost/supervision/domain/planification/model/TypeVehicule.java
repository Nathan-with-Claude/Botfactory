package com.docapost.supervision.domain.planification.model;

/**
 * TypeVehicule — Enumération BC-07 Planification
 *
 * Classe de véhicule utilisé pour les tournées de livraison.
 *
 * Source : US-030
 */
public enum TypeVehicule {
    /** Fourgon standard (ex. Renault Master, Mercedes Sprinter) */
    FOURGON,
    /** Véhicule utilitaire léger (ex. Kangoo, Transit Connect) */
    UTILITAIRE_LEGER,
    /** Cargo vélo ou tricycle électrique */
    CARGO_VELO,
    /** Poids lourd (rares tournées longues distances) */
    POIDS_LOURD
}
