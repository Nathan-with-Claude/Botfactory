package com.docapost.tournee.application;

/**
 * Exception levée quand aucune PreuveLivraison n'est trouvée pour un colisId donné.
 *
 * Source : US-010 — invariant "HTTP 404 si aucune preuve".
 */
public class PreuveNotFoundException extends RuntimeException {

    public PreuveNotFoundException(String colisId) {
        super("Aucune preuve de livraison trouvée pour le colis : " + colisId);
    }
}
