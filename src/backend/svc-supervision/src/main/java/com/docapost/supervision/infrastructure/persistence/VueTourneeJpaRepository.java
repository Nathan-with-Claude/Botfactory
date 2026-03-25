package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Spring Data JPA Repository pour VueTourneeEntity (US-011).
 */
public interface VueTourneeJpaRepository extends JpaRepository<VueTourneeEntity, String> {

    List<VueTourneeEntity> findByStatut(StatutTourneeVue statut);

    @Query("SELECT v FROM VueTourneeEntity v WHERE v.statut IN ('EN_COURS', 'A_RISQUE')")
    List<VueTourneeEntity> findAllEnCours();
}
