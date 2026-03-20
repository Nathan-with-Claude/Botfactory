package com.docapost.tournee.application;

import java.time.LocalDate;

/**
 * Exception applicative — Aucune tournee trouvee pour ce livreur a cette date.
 * Correspond au Scenario 3 de la US-001 : tournee sans colis assignes.
 * Traduite en HTTP 404 par le controller.
 */
public class TourneeNotFoundException extends RuntimeException {

    public TourneeNotFoundException(String livreurId, LocalDate date) {
        super("Aucune tournee trouvee pour le livreur '" + livreurId + "' a la date " + date);
    }
}
