package com.docapost.supervision.domain.broadcast;

/**
 * BroadcastStatut — Value Object (enum) BC-03 / US-067
 *
 * Statut de lecture d'un BroadcastMessage par un livreur.
 * Utilisé pour US-069 (consulter statuts lecture).
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public enum BroadcastStatut {
    /** Message envoyé mais pas encore lu par le livreur */
    ENVOYE,
    /** Message vu par le livreur (accusé de réception) */
    VU
}
