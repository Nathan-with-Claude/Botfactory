package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.service.LivreurReferentiel;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ProdLivreurReferentiel — Implémentation @Profile("prod") du référentiel livreurs / US-066
 *
 * En attendant l'intégration Keycloak (BC-06), utilise la même liste hardcodée que DevLivreurReferentiel.
 * TODO: remplacer par Bc06LivreurReferentiel qui interroge l'API admin Keycloak.
 */
@Component
@Profile({"prod", "recette"})
public class ProdLivreurReferentiel implements LivreurReferentiel {

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
