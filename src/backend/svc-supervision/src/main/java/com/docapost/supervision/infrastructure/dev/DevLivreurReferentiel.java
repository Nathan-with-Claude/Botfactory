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
            new LivreurInfo("livreur-pierre-martin",  "Pierre Martin"),
            new LivreurInfo("livreur-paul-dupont",    "Paul Dupont"),
            new LivreurInfo("livreur-marie-lambert",  "Marie Lambert"),
            new LivreurInfo("livreur-jean-moreau",    "Jean Moreau"),
            new LivreurInfo("livreur-sophie-bernard", "Sophie Bernard"),
            new LivreurInfo("livreur-lucas-petit",    "Lucas Petit")
    );

    @Override
    public List<LivreurInfo> listerLivreurs() {
        return REFERENTIEL;
    }
}
