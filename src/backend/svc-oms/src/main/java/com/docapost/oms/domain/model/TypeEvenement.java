package com.docapost.oms.domain.model;

/**
 * Types d'événements de livraison historisés dans l'Event Store (BC-05).
 *
 * Ces types correspondent aux Domain Events émis par BC-01 (svc-tournee).
 */
public enum TypeEvenement {
    TOURNEE_DEMARREE,
    LIVRAISON_CONFIRMEE,
    ECHEC_LIVRAISON_DECLARE,
    TOURNEE_CLOTUREE
}
