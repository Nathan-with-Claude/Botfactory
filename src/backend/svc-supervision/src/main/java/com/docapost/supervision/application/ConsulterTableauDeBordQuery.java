package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;

/**
 * Query — Consulter le tableau de bord des tournées (US-011).
 *
 * @param filtreStatut statut optionnel pour filtrer (null = tous)
 */
public record ConsulterTableauDeBordQuery(StatutTourneeVue filtreStatut) {

    /** Query sans filtre — retourne toutes les tournées */
    public static ConsulterTableauDeBordQuery sansFiltre() {
        return new ConsulterTableauDeBordQuery(null);
    }
}
