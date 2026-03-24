package com.docapost.oms.domain.model;

/**
 * Statut de synchronisation d'un événement vers l'OMS externe.
 *
 * Cycle : PENDING → SYNCHRONIZED (succès) | FAILED (après N tentatives)
 * Les événements FAILED peuvent être rejoués manuellement (US-017).
 */
public enum StatutSynchronisation {
    /** En attente de transmission (outbox) */
    PENDING,
    /** Transmis à l'OMS avec succès */
    SYNCHRONIZED,
    /** Transmission définitivement échouée (max tentatives atteint) */
    FAILED
}
