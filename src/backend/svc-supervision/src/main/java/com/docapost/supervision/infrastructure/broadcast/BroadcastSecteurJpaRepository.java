package com.docapost.supervision.infrastructure.broadcast;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * BroadcastSecteurJpaRepository — Spring Data JPA BC-03 / US-067
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public interface BroadcastSecteurJpaRepository
        extends JpaRepository<BroadcastSecteurEntity, String> {

    List<BroadcastSecteurEntity> findByActifTrue();
}
