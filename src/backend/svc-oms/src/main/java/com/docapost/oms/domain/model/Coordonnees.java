package com.docapost.oms.domain.model;

/**
 * Value Object immuable — coordonnées GPS au moment de l'événement.
 *
 * Peut être null (mode dégradé GPS documenté dans EvenementLivraison.modeDegradGPS).
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

    @Override
    public String toString() {
        return latitude + "," + longitude;
    }
}
