package com.docapost.oms.application;

/**
 * Lancée quand un eventId est déjà présent dans l'Event Store.
 * Garantit l'idempotence (US-017 Scénario 3).
 */
public class EvenementDejaExistantException extends RuntimeException {
    public EvenementDejaExistantException(String eventId) {
        super("Événement déjà enregistré dans l'Event Store : " + eventId);
    }
}
