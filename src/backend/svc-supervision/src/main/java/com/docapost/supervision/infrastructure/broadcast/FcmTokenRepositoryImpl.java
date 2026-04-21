package com.docapost.supervision.infrastructure.broadcast;

import com.docapost.supervision.domain.broadcast.repository.FcmTokenRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * FcmTokenRepositoryImpl — Implémentation Infrastructure BC-03 / US-067
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Repository
public class FcmTokenRepositoryImpl implements FcmTokenRepository {

    private final FcmTokenJpaRepository jpa;

    public FcmTokenRepositoryImpl(FcmTokenJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Map<String, String> findTokensByLivreurIds(List<String> livreurIds) {
        return jpa.findAllByLivreurIdIn(livreurIds).stream()
                .collect(Collectors.toMap(
                        FcmTokenEntity::getLivreurId,
                        FcmTokenEntity::getToken
                ));
    }
}
