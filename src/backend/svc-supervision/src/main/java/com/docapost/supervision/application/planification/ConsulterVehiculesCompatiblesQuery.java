package com.docapost.supervision.application.planification;

/**
 * ConsulterVehiculesCompatiblesQuery — Query Application Layer BC-07 (US-034)
 *
 * Demande la liste des véhicules dont la capacité est >= poidsMinKg.
 * Utilisé après un échec de compatibilité pour proposer des alternatives.
 *
 * @param poidsMinKg capacité minimale requise (>= poids estimé de la tournée)
 *
 * Source : US-034
 */
public record ConsulterVehiculesCompatiblesQuery(int poidsMinKg) {

    public ConsulterVehiculesCompatiblesQuery {
        if (poidsMinKg <= 0) {
            throw new IllegalArgumentException("Le poids minimum doit être strictement positif");
        }
    }
}
