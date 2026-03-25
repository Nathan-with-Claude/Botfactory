package com.docapost.tournee.domain.preuves.model;

/**
 * Value Object — Coordonnées GPS d'une capture de preuve.
 * Capturées automatiquement au moment de la validation (non saisissables manuellement).
 * Peut être null en mode dégradé (signal GPS indisponible).
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves.
 */
public record Coordonnees(double latitude, double longitude) {

    public Coordonnees {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude invalide : " + latitude);
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude invalide : " + longitude);
        }
    }
}
