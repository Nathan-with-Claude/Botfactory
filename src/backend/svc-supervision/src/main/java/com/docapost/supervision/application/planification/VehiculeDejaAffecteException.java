package com.docapost.supervision.application.planification;

/**
 * VehiculeDejaAffecteException — Exception applicative BC-07 (US-023)
 *
 * Levée quand un véhicule est déjà affecté à une autre tournée pour la journée.
 * Traduite en HTTP 409 dans l'Interface Layer.
 *
 * Source : US-023
 */
public class VehiculeDejaAffecteException extends RuntimeException {

    public VehiculeDejaAffecteException(String vehiculeId) {
        super("Le véhicule " + vehiculeId + " est déjà affecté à une tournée pour la journée.");
    }
}
