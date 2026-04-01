package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Implémentation JPA du port VueTourneeRepository (US-011).
 *
 * Stratégie de sauvegarde : find existing → update fields ou create new.
 */
@Repository
public class VueTourneeRepositoryImpl implements VueTourneeRepository {

    private final VueTourneeJpaRepository jpaRepository;

    public VueTourneeRepositoryImpl(VueTourneeJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<VueTournee> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<VueTournee> findByStatut(StatutTourneeVue statut) {
        return jpaRepository.findByStatut(statut).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<VueTournee> findByTourneeId(String tourneeId) {
        return jpaRepository.findById(tourneeId).map(this::toDomain);
    }

    @Override
    public VueTournee save(VueTournee vueTournee) {
        VueTourneeEntity entity = jpaRepository.findById(vueTournee.getTourneeId())
                .orElse(null);

        if (entity == null) {
            entity = new VueTourneeEntity(
                    vueTournee.getTourneeId(),
                    vueTournee.getLivreurNom(),
                    vueTournee.getColisTraites(),
                    vueTournee.getColisTotal(),
                    vueTournee.getPourcentage(),
                    vueTournee.getStatut(),
                    vueTournee.getDerniereActivite(),
                    vueTournee.getCodeTMS(),
                    vueTournee.getZone()
            );
        } else {
            entity.setLivreurNom(vueTournee.getLivreurNom());
            entity.setColisTraites(vueTournee.getColisTraites());
            entity.setColisTotal(vueTournee.getColisTotal());
            entity.setPourcentage(vueTournee.getPourcentage());
            entity.setStatut(vueTournee.getStatut());
            entity.setDerniereActivite(vueTournee.getDerniereActivite());
            entity.setCodeTMS(vueTournee.getCodeTMS());
            entity.setZone(vueTournee.getZone());
        }

        VueTourneeEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<VueTournee> findAllEnCours() {
        return jpaRepository.findAllEnCours().stream()
                .map(this::toDomain)
                .toList();
    }

    private VueTournee toDomain(VueTourneeEntity entity) {
        return new VueTournee(
                entity.getTourneeId(),
                entity.getLivreurNom(),
                entity.getColisTraites(),
                entity.getColisTotal(),
                entity.getStatut(),
                entity.getDerniereActivite(),
                entity.getCodeTMS(),
                entity.getZone()
        );
    }
}
