package com.docapost.tournee.domain.preuves.model;

import java.util.Objects;

/**
 * Value Object — Tiers ayant réceptionné le colis à la place du destinataire.
 * Le nom du tiers est obligatoire (invariant US-009).
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves (US-009).
 */
public record TiersIdentifie(String nomTiers) {

    public TiersIdentifie {
        Objects.requireNonNull(nomTiers, "Le nom du tiers est obligatoire");
        if (nomTiers.isBlank()) {
            throw new PreuveLivraisonInvariantException(
                    "Le nom du tiers ne peut pas etre vide (invariant US-009)"
            );
        }
    }
}
