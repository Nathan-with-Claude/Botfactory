package com.docapost.tournee.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA Repository — PreuveLivraisonEntity.
 * Interface technique sans logique métier.
 */
public interface PreuveLivraisonJpaRepository extends JpaRepository<PreuveLivraisonEntity, String> {

    Optional<PreuveLivraisonEntity> findByColisId(String colisId);
}
