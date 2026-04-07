package com.docapost.supervision.domain.planification.service;

import java.util.List;

/**
 * LivreurReferentiel — Port (interface) de lecture du référentiel livreurs / US-066
 *
 * Fournit la liste des livreurs inscrits dans le système pour la journée.
 * Stable sur la journée — appelé une fois par requête GET /api/supervision/livreurs/etat-du-jour.
 *
 * Implémentations :
 * - DevLivreurReferentiel (@Profile("dev")) : liste hardcodée des 6 livreurs canoniques
 * - Bc06LivreurReferentiel (prod, post-MVP) : interroge BC-06/Keycloak via API d'administration
 *
 * Source : US-066
 */
public interface LivreurReferentiel {

    /**
     * Retourne la liste complète des livreurs du référentiel.
     * L'ordre de la liste est stable entre les appels (trié par livreurId ou nom).
     */
    List<LivreurInfo> listerLivreurs();

    /**
     * Informations minimales nécessaires pour dériver l'état d'un livreur.
     *
     * @param livreurId  identifiant technique stable (ex: "livreur-pierre-martin")
     * @param nomComplet nom affiché dans l'interface (ex: "Pierre Martin")
     */
    record LivreurInfo(String livreurId, String nomComplet) {}
}
