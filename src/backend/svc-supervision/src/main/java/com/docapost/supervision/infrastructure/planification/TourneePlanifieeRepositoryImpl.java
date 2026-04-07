package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.model.StatutAffectation;
import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * TourneePlanifieeRepositoryImpl — Implémentation JPA BC-07
 *
 * Source : US-021, US-022, US-023, US-024
 */
@Repository
public class TourneePlanifieeRepositoryImpl implements TourneePlanifieeRepository {

    private final TourneePlanifieeJpaRepository jpaRepository;

    public TourneePlanifieeRepositoryImpl(TourneePlanifieeJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void save(TourneePlanifiee tourneePlanifiee) {
        TourneePlanifieeEntity entity = TourneePlanifieeMapper.toEntity(tourneePlanifiee);
        // Mise à jour des champs mutables si l'entité existe déjà
        jpaRepository.findById(entity.getId()).ifPresentOrElse(
                existing -> {
                    existing.setStatut(entity.getStatut());
                    existing.setLivreurId(entity.getLivreurId());
                    existing.setLivreurNom(entity.getLivreurNom());
                    existing.setVehiculeId(entity.getVehiculeId());
                    existing.setAffecteeLe(entity.getAffecteeLe());
                    existing.setLancee(entity.getLancee());
                    existing.setCompositionVerifiee(entity.isCompositionVerifiee());
                    jpaRepository.save(existing);
                },
                () -> jpaRepository.save(entity)
        );
    }

    @Override
    public Optional<TourneePlanifiee> findById(String id) {
        return jpaRepository.findById(id).map(TourneePlanifieeMapper::toDomain);
    }

    @Override
    public List<TourneePlanifiee> findByDate(LocalDate date) {
        return jpaRepository.findByDate(date).stream()
                .map(TourneePlanifieeMapper::toDomain)
                .toList();
    }

    @Override
    public List<TourneePlanifiee> findByDateAndStatut(LocalDate date, StatutAffectation statut) {
        return jpaRepository.findByDateAndStatut(date, statut).stream()
                .map(TourneePlanifieeMapper::toDomain)
                .toList();
    }

    @Override
    public boolean isLivreurDejaAffecte(String livreurId, LocalDate date) {
        return jpaRepository.existsByLivreurIdAndDate(livreurId, date);
    }

    @Override
    public boolean isVehiculeDejaAffecte(String vehiculeId, LocalDate date) {
        return jpaRepository.existsByVehiculeIdAndDate(vehiculeId, date);
    }

    @Override
    public Optional<TourneePlanifiee> findByLivreurIdAndDate(String livreurId, LocalDate date) {
        return jpaRepository.findAffecteeOrLanceeByLivreurIdAndDate(livreurId, date)
                .map(TourneePlanifieeMapper::toDomain);
    }
}
