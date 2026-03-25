package com.docapost.tournee.domain.preuves.repository;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.domain.preuves.model.PreuveLivraisonId;

import java.util.Optional;

/**
 * Port — Repository des PreuveLivraison (BC-02 Gestion des Preuves).
 * Interface dans le domaine, implémentation dans l'infrastructure.
 *
 * Source : Architecture hexagonale DDD — séparation port/adapter.
 */
public interface PreuveLivraisonRepository {

    /**
     * Sauvegarde une PreuveLivraison (création uniquement — immuable).
     *
     * @param preuve la preuve à persister
     * @return la preuve avec son identifiant assigné
     */
    PreuveLivraison save(PreuveLivraison preuve);

    /**
     * Recherche une PreuveLivraison par son identifiant.
     *
     * @param id identifiant de la preuve
     * @return Optional contenant la preuve, ou vide si introuvable
     */
    Optional<PreuveLivraison> findById(PreuveLivraisonId id);

    /**
     * Recherche la PreuveLivraison associée à un Colis.
     *
     * @param colisId identifiant du colis
     * @return Optional contenant la preuve, ou vide si aucune preuve capturée
     */
    Optional<PreuveLivraison> findByColisId(ColisId colisId);
}
