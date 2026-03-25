package com.docapost.supervision.application;

/**
 * Exception métier — InstructionDejaEnAttenteException (BC-03 Supervision — US-014)
 *
 * Levée quand un superviseur tente d'envoyer une instruction sur un colis
 * qui a déjà une instruction au statut ENVOYEE.
 *
 * Invariant : un colis ne peut avoir qu'une seule instruction en attente à la fois.
 *
 * HTTP : 409 Conflict
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
public class InstructionDejaEnAttenteException extends RuntimeException {

    public InstructionDejaEnAttenteException(String colisId) {
        super("Une instruction est déjà en attente d'exécution pour le colis : " + colisId
                + ". Attendez la confirmation du livreur avant d'en envoyer une nouvelle.");
    }
}
