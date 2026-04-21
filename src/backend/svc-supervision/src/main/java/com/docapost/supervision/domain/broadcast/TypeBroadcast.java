package com.docapost.supervision.domain.broadcast;

/**
 * TypeBroadcast — Value Object (enum) BC-03 / US-067
 *
 * Qualifie la nature du message broadcast envoyé par le superviseur.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public enum TypeBroadcast {
    /** Message d'alerte urgent (ex : incident terrain, route barrée) */
    ALERTE,
    /** Information générale */
    INFO,
    /** Consigne opérationnelle à appliquer */
    CONSIGNE
}
