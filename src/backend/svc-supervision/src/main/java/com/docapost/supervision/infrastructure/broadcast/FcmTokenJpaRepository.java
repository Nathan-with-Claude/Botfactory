package com.docapost.supervision.infrastructure.broadcast;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * FcmTokenJpaRepository — Spring Data JPA BC-03 / US-067
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public interface FcmTokenJpaRepository
        extends JpaRepository<FcmTokenEntity, String> {

    /**
     * Récupère tous les tokens pour une liste de livreurs.
     *
     * @param livreurIds liste d'identifiants livreurs
     * @return liste des FcmTokenEntity correspondants
     */
    List<FcmTokenEntity> findAllByLivreurIdIn(List<String> livreurIds);
}
