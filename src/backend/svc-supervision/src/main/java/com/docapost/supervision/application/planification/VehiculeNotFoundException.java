package com.docapost.supervision.application.planification;

/**
 * VehiculeNotFoundException — Exception applicative BC-07 (US-030)
 *
 * Levée quand un Vehicule n'est pas trouvé dans le Repository.
 *
 * Source : US-030
 */
public class VehiculeNotFoundException extends RuntimeException {

    public VehiculeNotFoundException(String vehiculeId) {
        super("Véhicule introuvable : " + vehiculeId);
    }
}
