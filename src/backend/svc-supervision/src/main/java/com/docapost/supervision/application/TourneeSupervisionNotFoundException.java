package com.docapost.supervision.application;

/**
 * Exception levée quand aucune tournée n'est trouvée dans le contexte supervision.
 * Source : US-012 — invariant "HTTP 404 si tournée introuvable".
 */
public class TourneeSupervisionNotFoundException extends RuntimeException {

    public TourneeSupervisionNotFoundException(String tourneeId) {
        super("Tournée introuvable dans la supervision : " + tourneeId);
    }
}
