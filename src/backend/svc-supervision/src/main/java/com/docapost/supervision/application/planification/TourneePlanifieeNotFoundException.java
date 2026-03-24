package com.docapost.supervision.application.planification;

/**
 * TourneePlanifieeNotFoundException — Exception applicative BC-07
 *
 * Levée quand une TourneePlanifiee n'est pas trouvée par son identifiant.
 * Traduite en HTTP 404 dans l'Interface Layer.
 *
 * Source : US-022, US-023, US-024
 */
public class TourneePlanifieeNotFoundException extends RuntimeException {

    public TourneePlanifieeNotFoundException(String id) {
        super("Tournée planifiée introuvable : " + id);
    }
}
