package com.docapost.supervision.domain.broadcast.repository;

import com.docapost.supervision.domain.broadcast.BroadcastMessage;

import java.util.Optional;

/**
 * BroadcastMessageRepository — Port (interface domaine) BC-03 / US-067
 *
 * Contrat de persistance pour l'aggregate root BroadcastMessage.
 * L'implémentation concrète se trouve dans l'infrastructure JPA.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public interface BroadcastMessageRepository {

    /**
     * Persiste un BroadcastMessage (création uniquement dans le cadre US-067).
     *
     * @param message l'aggregate root à sauvegarder
     * @return le message sauvegardé
     */
    BroadcastMessage save(BroadcastMessage message);

    /**
     * Recherche un BroadcastMessage par identifiant.
     *
     * @param id identifiant unique
     * @return Optional contenant le message si trouvé
     */
    Optional<BroadcastMessage> findById(String id);
}
