package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Implementation du port TourneeRepository (couche infrastructure).
 * Utilise Spring Data JPA + TourneeMapper pour isoler le domaine de la persistance.
 *
 * L'Application Service depend de TourneeRepository (interface domain),
 * pas de cette classe.
 */
@Repository
public class TourneeRepositoryImpl implements TourneeRepository {

    private final TourneeJpaRepository jpaRepository;
    private final TourneeMapper mapper;

    public TourneeRepositoryImpl(TourneeJpaRepository jpaRepository, TourneeMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Tournee> findByLivreurIdAndDate(LivreurId livreurId, LocalDate date) {
        return jpaRepository
                .findByLivreurIdAndDate(livreurId.value(), date)
                .map(mapper::toDomain);
    }

    @Override
    public Tournee save(Tournee tournee) {
        // Strategie : chercher l'entite existante et mettre a jour son statut
        // pour eviter de reconstruire toutes les associations (colis).
        Optional<TourneeEntity> existing = jpaRepository.findById(tournee.getId().value());

        if (existing.isPresent()) {
            TourneeEntity entity = existing.get();
            mapper.updateStatut(entity, tournee);
            TourneeEntity saved = jpaRepository.save(entity);
            return mapper.toDomain(saved);
        } else {
            TourneeEntity entity = mapper.toEntity(tournee);
            TourneeEntity saved = jpaRepository.save(entity);
            return mapper.toDomain(saved);
        }
    }

    @Override
    public Optional<Tournee> findById(TourneeId tourneeId) {
        return jpaRepository.findById(tourneeId.value())
                .map(mapper::toDomain);
    }

    @Override
    public void deleteByLivreurIdAndDate(LivreurId livreurId, java.time.LocalDate date) {
        jpaRepository.deleteByLivreurIdAndDate(livreurId.value(), date);
    }
}
