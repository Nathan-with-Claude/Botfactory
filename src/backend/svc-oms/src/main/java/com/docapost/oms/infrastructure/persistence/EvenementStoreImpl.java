package com.docapost.oms.infrastructure.persistence;

import com.docapost.oms.domain.model.Coordonnees;
import com.docapost.oms.domain.model.EvenementLivraison;
import com.docapost.oms.domain.model.StatutSynchronisation;
import com.docapost.oms.domain.repository.EvenementStore;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Implémentation JPA de l'Event Store (US-018).
 *
 * Politique append-only :
 * - append() : INSERT uniquement. La contrainte UNIQUE sur event_id rejette les doublons en BDD.
 * - updateStatut() : seule mise à jour autorisée (outbox pattern US-017).
 * - Aucune méthode delete n'est implémentée.
 */
@Repository
public class EvenementStoreImpl implements EvenementStore {

    private final EvenementJpaRepository jpaRepository;

    public EvenementStoreImpl(EvenementJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void append(EvenementLivraison ev) {
        EvenementEntity entity = new EvenementEntity(
                ev.eventId(),
                ev.tourneeId(),
                ev.colisId(),
                ev.livreurId(),
                ev.type(),
                ev.horodatage(),
                ev.coordonnees() != null ? ev.coordonnees().latitude() : null,
                ev.coordonnees() != null ? ev.coordonnees().longitude() : null,
                ev.modeDegradGPS(),
                ev.preuveLivraisonId(),
                ev.motifEchec(),
                ev.statutSynchronisation(),
                ev.tentativesSynchronisation()
        );
        jpaRepository.save(entity);
    }

    @Override
    public void updateStatut(String eventId, StatutSynchronisation statut, int tentatives) {
        jpaRepository.findById(eventId).ifPresent(entity -> {
            entity.setStatutSynchronisation(statut);
            entity.setTentativesSynchronisation(tentatives);
            jpaRepository.save(entity);
        });
    }

    @Override
    public Optional<EvenementLivraison> findById(String eventId) {
        return jpaRepository.findById(eventId).map(this::toEvenement);
    }

    @Override
    public List<EvenementLivraison> findByColisId(String colisId) {
        return jpaRepository.findByColisIdOrderByHorodatageAsc(colisId)
                .stream().map(this::toEvenement).toList();
    }

    @Override
    public List<EvenementLivraison> findByTourneeId(String tourneeId) {
        return jpaRepository.findByTourneeIdOrderByHorodatageAsc(tourneeId)
                .stream().map(this::toEvenement).toList();
    }

    @Override
    public List<EvenementLivraison> findEnAttente() {
        return jpaRepository.findByStatutSynchronisation(StatutSynchronisation.PENDING)
                .stream().map(this::toEvenement).toList();
    }

    private EvenementLivraison toEvenement(EvenementEntity e) {
        Coordonnees coords = (e.getLatitude() != null && e.getLongitude() != null)
                ? new Coordonnees(e.getLatitude(), e.getLongitude())
                : null;
        return new EvenementLivraison(
                e.getEventId(),
                e.getTourneeId(),
                e.getColisId(),
                e.getLivreurId(),
                e.getType(),
                e.getHorodatage(),
                coords,
                e.isModeDegradGPS(),
                e.getPreuveLivraisonId(),
                e.getMotifEchec(),
                e.getStatutSynchronisation(),
                e.getTentativesSynchronisation()
        );
    }
}
