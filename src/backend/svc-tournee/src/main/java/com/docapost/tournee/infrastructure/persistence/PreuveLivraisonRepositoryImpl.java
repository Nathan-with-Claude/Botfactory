package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.domain.preuves.model.PreuveLivraisonId;
import com.docapost.tournee.domain.preuves.repository.PreuveLivraisonRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Implémentation JPA du PreuveLivraisonRepository (BC-02).
 *
 * MVP : colocalisée dans svc-tournee (décision technique documentée dans US-008-impl.md).
 * TODO : migrer vers svc-gestion-preuves quand BC-02 sera extrait en service indépendant.
 */
@Repository
public class PreuveLivraisonRepositoryImpl implements PreuveLivraisonRepository {

    private final PreuveLivraisonJpaRepository jpaRepository;

    public PreuveLivraisonRepositoryImpl(PreuveLivraisonJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public PreuveLivraison save(PreuveLivraison preuve) {
        PreuveLivraisonEntity entity = PreuveLivraisonMapper.toEntity(preuve);
        jpaRepository.save(entity);
        return preuve;
    }

    @Override
    public Optional<PreuveLivraison> findById(PreuveLivraisonId id) {
        return jpaRepository.findById(id.value())
                .map(PreuveLivraisonMapper::toDomain);
    }

    @Override
    public Optional<PreuveLivraison> findByColisId(ColisId colisId) {
        return jpaRepository.findByColisId(colisId.value())
                .map(PreuveLivraisonMapper::toDomain);
    }
}
