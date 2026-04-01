package com.docapost.tournee.domain.repository;

import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.model.TourneeId;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Port — Interface du Repository Tournee (Domain Layer).
 * Implemente dans Infrastructure Layer (TourneeRepositoryImpl).
 *
 * L'Application Service depend de cette interface, jamais de l'implementation.
 */
public interface TourneeRepository {

    /**
     * Trouve la tournee d'un livreur pour une date donnee.
     * Utilise par ConsulterListeColisHandler (US-001).
     */
    Optional<Tournee> findByLivreurIdAndDate(LivreurId livreurId, LocalDate date);

    /**
     * Sauvegarde ou met a jour une tournee.
     */
    Tournee save(Tournee tournee);

    /**
     * Trouve une tournee par son identifiant.
     */
    Optional<Tournee> findById(TourneeId tourneeId);

    /**
     * Supprime la tournee d'un livreur pour une date donnee.
     * Utilise par DevTourneeController pour remplacer une tournee existante.
     */
    void deleteByLivreurIdAndDate(LivreurId livreurId, LocalDate date);
}
