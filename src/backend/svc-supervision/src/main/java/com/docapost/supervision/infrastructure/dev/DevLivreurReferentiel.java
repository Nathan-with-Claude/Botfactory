package com.docapost.supervision.infrastructure.dev;

import com.docapost.supervision.domain.planification.service.LivreurReferentiel;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DevLivreurReferentiel — Implémentation @Profile("dev") du référentiel livreurs / US-066
 *
 * Liste hardcodée des 6 livreurs canoniques du référentiel de développement.
 * Les IDs sont alignés avec DevDataSeeder.java (BC-07).
 *
 * Substitution prod : Bc06LivreurReferentiel interroge BC-06/Keycloak via API admin.
 *
 * Source : US-066
 */
@Component
@Profile("dev")
public class DevLivreurReferentiel implements LivreurReferentiel {

    private static final List<LivreurInfo> REFERENTIEL = List.of(
            new LivreurInfo("livreur-001", "Pierre Martin"),
            new LivreurInfo("livreur-002", "Paul Dupont"),
            new LivreurInfo("livreur-003", "Marie Lambert"),
            new LivreurInfo("livreur-004", "Jean Moreau"),
            new LivreurInfo("livreur-005", "Sophie Bernard"),
            new LivreurInfo("livreur-006", "Lucas Petit")
    );

    @Override
    public List<LivreurInfo> listerLivreurs() {
        return REFERENTIEL;
    }
}
