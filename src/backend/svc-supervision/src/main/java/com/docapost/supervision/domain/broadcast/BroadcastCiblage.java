package com.docapost.supervision.domain.broadcast;

import java.util.List;
import java.util.Objects;

/**
 * BroadcastCiblage — Value Object immuable BC-03 / US-067
 *
 * Encapsule la stratégie de ciblage d'un broadcast :
 * - TOUS : liste secteurs vide (ignored)
 * - SECTEUR : liste de codes secteur prédéfinis (actif = true dans broadcast_secteur)
 *
 * Immuable par record — comparaison par valeur.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastCiblage(
        TypeCiblage type,
        List<String> secteurs
) {
    public BroadcastCiblage {
        Objects.requireNonNull(type, "Le type de ciblage ne peut pas être null");
        secteurs = secteurs == null ? List.of() : List.copyOf(secteurs);
    }
}
