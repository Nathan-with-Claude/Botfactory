package com.docapost.supervision.domain.broadcast;

import java.util.List;
import java.util.Objects;

/**
 * BroadcastSecteur — Value Object immuable BC-03 / US-067
 *
 * Représente un secteur géographique prédéfini pouvant être ciblé
 * lors d'un broadcast de type SECTEUR.
 *
 * Porte la liste des livreurIds affectés à ce secteur pour permettre
 * le filtrage lors de l'envoi (résolution secteur → livreurs).
 *
 * Stocké en base (broadcast_secteur), actif = true si disponible pour le ciblage.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastSecteur(
        /** Code technique du secteur (ex: "SECT-IDF-01") */
        String codeSecteur,
        /** Libellé affiché dans l'interface superviseur */
        String libelle,
        /** Vrai si le secteur est disponible pour le ciblage */
        boolean actif,
        /** Identifiants des livreurs affectés à ce secteur */
        List<String> livreurIds
) {
    public BroadcastSecteur {
        Objects.requireNonNull(codeSecteur, "Le code secteur ne peut pas être null");
        Objects.requireNonNull(libelle, "Le libellé ne peut pas être null");
        livreurIds = livreurIds == null ? List.of() : List.copyOf(livreurIds);
    }
}
