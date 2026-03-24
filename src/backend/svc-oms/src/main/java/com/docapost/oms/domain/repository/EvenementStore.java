package com.docapost.oms.domain.repository;

import com.docapost.oms.domain.model.EvenementLivraison;
import com.docapost.oms.domain.model.StatutSynchronisation;

import java.util.List;
import java.util.Optional;

/**
 * Port — Event Store append-only (US-018).
 *
 * Contrat :
 * - append() : seule opération d'écriture autorisée. Toute mise à jour ou suppression
 *   est interdite par la politique append-only de l'Event Store.
 * - updateStatut() : cas d'usage exceptionnel autorisé uniquement pour la colonne
 *   statut_synchronisation (outbox pattern US-017) — le contenu de l'événement reste immuable.
 * - Aucune méthode delete n'est exposée dans cette interface.
 */
public interface EvenementStore {

    /** Enregistre un nouvel événement (append-only). Lance une exception si eventId existe déjà. */
    void append(EvenementLivraison evenement);

    /** Mise à jour du seul statut de synchronisation (outbox) — contenu événement immuable. */
    void updateStatut(String eventId, StatutSynchronisation statut, int tentatives);

    Optional<EvenementLivraison> findById(String eventId);

    /** Historique complet d'un colis (ordre chronologique ascendant). */
    List<EvenementLivraison> findByColisId(String colisId);

    /** Historique complet d'une tournée (ordre chronologique ascendant). */
    List<EvenementLivraison> findByTourneeId(String tourneeId);

    /** Événements en attente de synchronisation OMS (PENDING). */
    List<EvenementLivraison> findEnAttente();
}
