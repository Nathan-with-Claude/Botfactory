package com.docapost.supervision.domain.repository;

import com.docapost.supervision.domain.model.VueTourneeDetail;

import java.util.Optional;

/**
 * Port — Repository du détail d'une tournée (BC-03 Supervision — US-012).
 *
 * Pour le MVP, les données de détail sont construites à partir des données
 * de VueTourneeEntity enrichies (colis + incidents en colonnes JSON ou tables liées).
 *
 * Source : Architecture hexagonale DDD.
 */
public interface VueTourneeDetailRepository {

    /**
     * Recherche le détail complet d'une tournée par son tourneeId.
     *
     * @param tourneeId identifiant de la tournée
     * @return Optional contenant le détail, ou vide si introuvable
     */
    Optional<VueTourneeDetail> findByTourneeId(String tourneeId);
}
