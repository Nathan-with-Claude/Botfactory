package com.docapost.supervision.domain.broadcast;

/**
 * TypeCiblage — Value Object (enum) BC-03 / US-067
 *
 * Détermine si le broadcast est envoyé à tous les livreurs actifs
 * ou uniquement aux livreurs d'un ou plusieurs secteurs prédéfinis.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public enum TypeCiblage {
    /** Tous les livreurs actifs (statut EN_COURS) */
    TOUS,
    /** Livreurs d'un ou plusieurs secteurs prédéfinis (broadcast_secteur.actif = true) */
    SECTEUR
}
