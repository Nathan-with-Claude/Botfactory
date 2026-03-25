package com.docapost.supervision.domain.repository;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;

import java.util.List;
import java.util.Optional;

/**
 * Port — Repository des VueTournee (BC-03 Supervision — US-011).
 * Interface dans le domaine, implémentation dans l'infrastructure.
 *
 * Source : Architecture hexagonale DDD — séparation port/adapter.
 */
public interface VueTourneeRepository {

    /**
     * Retourne toutes les VueTournee.
     */
    List<VueTournee> findAll();

    /**
     * Retourne les VueTournee filtrées par statut.
     *
     * @param statut filtre de statut (EN_COURS, A_RISQUE, CLOTUREE)
     * @return liste filtrée
     */
    List<VueTournee> findByStatut(StatutTourneeVue statut);

    /**
     * Recherche une VueTournee par son tourneeId.
     *
     * @param tourneeId identifiant de la tournée
     * @return Optional contenant la vue, ou vide si introuvable
     */
    Optional<VueTournee> findByTourneeId(String tourneeId);

    /**
     * Sauvegarde (créer ou mettre à jour) une VueTournee.
     *
     * @param vueTournee la vue à persister
     * @return la vue persistée
     */
    VueTournee save(VueTournee vueTournee);

    /**
     * Retourne toutes les VueTournee avec statut EN_COURS ou A_RISQUE.
     * Utilisé par le scheduler de détection de risque (US-013).
     */
    List<VueTournee> findAllEnCours();
}
