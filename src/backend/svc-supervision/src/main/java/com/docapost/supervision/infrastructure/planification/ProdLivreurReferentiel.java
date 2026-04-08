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
