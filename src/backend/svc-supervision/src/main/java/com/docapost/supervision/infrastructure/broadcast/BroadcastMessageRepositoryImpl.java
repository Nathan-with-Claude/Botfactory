package com.docapost.supervision.infrastructure.broadcast;

import com.docapost.supervision.domain.broadcast.BroadcastCiblage;
import com.docapost.supervision.domain.broadcast.BroadcastMessage;
import com.docapost.supervision.domain.broadcast.repository.BroadcastMessageRepository;
import com.docapost.supervision.domain.broadcast.TypeBroadcast;
import com.docapost.supervision.domain.broadcast.TypeCiblage;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * BroadcastMessageRepositoryImpl — Implémentation Infrastructure BC-03 / US-067
 *
 * Implémente le port domaine BroadcastMessageRepository via Spring Data JPA.
 * Assure le mapping domain ↔ entity dans les deux sens.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Repository
public class BroadcastMessageRepositoryImpl implements BroadcastMessageRepository {

    private final BroadcastMessageJpaRepository jpa;

    public BroadcastMessageRepositoryImpl(BroadcastMessageJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public BroadcastMessage save(BroadcastMessage message) {
        BroadcastMessageEntity entity = toEntity(message);
        jpa.save(entity);
        return message;
    }

    @Override
    public Optional<BroadcastMessage> findById(String id) {
        return jpa.findById(id).map(this::toDomain);
    }

    // ─── Mapping domain → entity ─────────────────────────────────────────────

    private BroadcastMessageEntity toEntity(BroadcastMessage m) {
        return new BroadcastMessageEntity(
                m.getId(),
                m.getType().name(),
                m.getTexte(),
                m.getCiblage().type().name(),
                m.getCiblage().secteurs(),
                m.getLivreurIds(),
                m.getSuperviseurId(),
                m.getHorodatageEnvoi()
        );
    }

    // ─── Mapping entity → domain ─────────────────────────────────────────────

    private BroadcastMessage toDomain(BroadcastMessageEntity e) {
        BroadcastCiblage ciblage = new BroadcastCiblage(
                TypeCiblage.valueOf(e.getTypeCiblage()),
                e.getSecteursCibles()
        );
        return BroadcastMessage.envoyer(
                e.getId(),
                TypeBroadcast.valueOf(e.getType()),
                e.getTexte(),
                ciblage,
                e.getSuperviseurId(),
                e.getLivreurIds()
        );
    }
}
