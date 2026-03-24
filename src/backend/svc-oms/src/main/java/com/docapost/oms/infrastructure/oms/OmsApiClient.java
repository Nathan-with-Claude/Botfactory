package com.docapost.oms.infrastructure.oms;

import com.docapost.oms.application.OmsApiPort;
import com.docapost.oms.domain.model.EvenementLivraison;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * ACL — Client HTTP vers l'API REST OMS externe (US-017).
 *
 * MVP : l'OMS externe est simulé (oms.api.enabled=false).
 * En mode simulé, toutes les transmissions sont considérées réussies et loggées.
 *
 * En production (oms.api.enabled=true), un RestTemplate appelle POST {oms.api.base-url}/statuts
 * avec le payload normalisé : livreurId, colisId, statut, horodatage, GPS, preuveLivraisonId.
 *
 * Le BC-05 est le seul point d'entrée vers l'OMS (Anti-Corruption Layer).
 * Aucune logique métier DocuPost n'est exposée à l'OMS.
 */
@Component
public class OmsApiClient implements OmsApiPort {

    private static final Logger log = LoggerFactory.getLogger(OmsApiClient.class);

    @Value("${oms.api.base-url:http://localhost:9090/api/oms}")
    private String baseUrl;

    @Value("${oms.api.enabled:false}")
    private boolean enabled;

    @Override
    public boolean transmettre(EvenementLivraison evenement) {
        if (!enabled) {
            // Simulation MVP — log et succès automatique
            log.info("[OMS-SIM] Transmission simulée → eventId={} type={} colisId={} livreurId={} horodatage={}",
                    evenement.eventId(),
                    evenement.type(),
                    evenement.colisId(),
                    evenement.livreurId(),
                    evenement.horodatage());
            return true;
        }

        // Production : appel HTTP réel (déféré Sprint 3 — nécessite provisionnement OMS)
        try {
            OmsPayload payload = OmsPayload.from(evenement);
            log.info("[OMS] POST {}/statuts eventId={}", baseUrl, evenement.eventId());
            // RestTemplate appel → à implémenter en Sprint 3
            // restTemplate.postForEntity(baseUrl + "/statuts", payload, Void.class);
            return true;
        } catch (Exception e) {
            log.error("[OMS] Échec transmission eventId={}: {}", evenement.eventId(), e.getMessage());
            return false;
        }
    }

    /** Payload normalisé transmis à l'OMS — format ACL (aucune classe interne DocuPost). */
    record OmsPayload(
            String eventId,
            String livreurId,
            String colisId,
            String statut,
            String horodatage,
            String latitude,
            String longitude,
            String preuveLivraisonId
    ) {
        static OmsPayload from(EvenementLivraison ev) {
            return new OmsPayload(
                    ev.eventId(),
                    ev.livreurId(),
                    ev.colisId(),
                    ev.type().name(),
                    ev.horodatage().toString(),
                    ev.coordonnees() != null ? String.valueOf(ev.coordonnees().latitude()) : null,
                    ev.coordonnees() != null ? String.valueOf(ev.coordonnees().longitude()) : null,
                    ev.preuveLivraisonId()
            );
        }
    }
}
