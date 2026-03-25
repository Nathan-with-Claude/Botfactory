package com.docapost.oms.infrastructure.persistence;

import com.docapost.oms.domain.model.StatutSynchronisation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Repository JPA pour l'Event Store (append-only). */
public interface EvenementJpaRepository extends JpaRepository<EvenementEntity, String> {

    List<EvenementEntity> findByColisIdOrderByHorodatageAsc(String colisId);

    List<EvenementEntity> findByTourneeIdOrderByHorodatageAsc(String tourneeId);

    List<EvenementEntity> findByStatutSynchronisation(StatutSynchronisation statut);
}
