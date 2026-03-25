package com.docapost.tournee.application;

/**
 * Exception applicative — Colis introuvable dans la Tournee (US-004).
 *
 * Levee par ConsulterDetailColisHandler quand le colisId fourni
 * ne correspond a aucun colis dans la tournee chargee.
 *
 * Source domaine : BC-01 Orchestration de Tournee.
 */
public class ColisNotFoundException extends RuntimeException {

    public ColisNotFoundException(String tourneeId, String colisId) {
        super(String.format("Colis '%s' introuvable dans la tournee '%s'", colisId, tourneeId));
    }
}
