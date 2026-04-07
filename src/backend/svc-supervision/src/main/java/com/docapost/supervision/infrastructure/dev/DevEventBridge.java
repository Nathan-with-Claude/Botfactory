package com.docapost.supervision.infrastructure.dev;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.persistence.VueColisEntity;
import com.docapost.supervision.infrastructure.persistence.VueColisJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * DevEventBridge — Pont d'événements inter-BC (profil dev uniquement).
 *
 * US-033 : Simule la propagation des événements domaine via Kafka (production)
 * par des appels HTTP directs entre services (dev/test).
 *
 * Quand TourneeLancee est émis dans BC-07 (svc-supervision) :
 * 1. Crée une VueTournee dans BC-03 (même service, accès direct au repository).
 * 2. Appelle POST svc-tournee/internal/dev/tournees pour créer la Tournee dans BC-01.
 *
 * Resilience :
 * - L'échec HTTP vers svc-tournee est logué mais ne propage pas l'exception.
 *   Le lancement de tournée dans BC-07 n'est pas annulé.
 *
 * Invariant prod : ce composant n'existe pas en profil "prod" (@Profile("dev")).
 *
 * Source : US-033 — SC2, SC3, SC4, SC6
 */
@Component
@Profile({"dev", "recette"})
public class DevEventBridge {

    private static final Logger log = LoggerFactory.getLogger(DevEventBridge.class);

    private final VueTourneeRepository vueTourneeRepository;
    private final VueColisJpaRepository vueColisJpaRepository;
    private final RestTemplate restTemplate;
    private final String svcTourneeBaseUrl;

    public DevEventBridge(
            VueTourneeRepository vueTourneeRepository,
            VueColisJpaRepository vueColisJpaRepository,
            RestTemplate restTemplate,
            @Value("${docupost.dev.svc-tournee-url:http://localhost:8081}") String svcTourneeBaseUrl
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.restTemplate = restTemplate;
        this.svcTourneeBaseUrl = svcTourneeBaseUrl;
    }

    /**
     * Propage l'événement TourneeLancee vers BC-03 et BC-01.
     *
     * BC-03 : crée une VueTournee EN_COURS (accès direct repository).
     * BC-01 : appelle POST {svcTourneeBaseUrl}/internal/dev/tournees via HTTP.
     *
     * L'idempotence est garantie : si la VueTournee existe déjà en BC-03,
     * elle n'est pas recréée (log INFO + continue).
     *
     * @param event l'événement TourneeLancee émis par BC-07
     */
    public void propaguerTourneeLancee(TourneeLancee event) {
        log.info("[DevEventBridge] propagation TourneeLancee tourneeId={} livreur={}",
                event.codeTms(), event.livreurId());

        // ── BC-03 : Créer VueTournee (idempotence) ──────────────────────────
        propaguerVersBC03(event);

        // ── BC-01 : Appeler svc-tournee (résilient) ─────────────────────────
        propaguerVersBC01(event);
    }

    // ─── BC-03 ────────────────────────────────────────────────────────────────

    private void propaguerVersBC03(TourneeLancee event) {
        Optional<VueTournee> existing = vueTourneeRepository.findByTourneeId(event.codeTms());
        if (existing.isPresent()) {
            log.info("[DevEventBridge] VueTournee deja presente (idempotence) tourneeId={}",
                    event.codeTms());
            return;
        }

        VueTournee vueTournee = new VueTournee(
                event.codeTms(),
                event.livreurNom(),
                0,                  // colisTraites = 0 au démarrage
                event.nbColis(),    // colisTotal = valeur réelle de la TourneePlanifiee
                StatutTourneeVue.EN_COURS,
                Instant.now()
        );
        vueTourneeRepository.save(vueTournee);
        log.info("[DevEventBridge] VueTournee creee en BC-03 tourneeId={}", event.codeTms());

        // Créer les VueColis placeholder (A_LIVRER) pour que le détail superviseur
        // ne soit pas vide. Les IDs correspondent à ceux générés par DevTourneeController.
        int nbColis = event.nbColis() > 0 ? event.nbColis() : 5;
        List<VueColisEntity> colisList = new java.util.ArrayList<>();
        for (int i = 0; i < nbColis; i++) {
            String colisId = event.codeTms() + "-C-" + String.format("%03d", i + 1);
            colisList.add(new VueColisEntity(event.codeTms(), colisId,
                    "Adresse " + (i + 1), "A_LIVRER", null, null));
        }
        vueColisJpaRepository.saveAll(colisList);
        log.info("[DevEventBridge] {} VueColis crees en BC-03 tourneeId={}", nbColis, event.codeTms());
    }

    // ─── BC-01 ────────────────────────────────────────────────────────────────

    private void propaguerVersBC01(TourneeLancee event) {
        String url = svcTourneeBaseUrl + "/internal/dev/tournees";

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("tourneeId", event.codeTms());
        body.put("livreurId", event.livreurId());
        body.put("livreurNom", event.livreurNom());
        body.put("nbColis", event.nbColis() > 0 ? event.nbColis() : 5);

        try {
            restTemplate.postForObject(url, body, String.class);
            log.info("[DevEventBridge] Tournee creee en BC-01 via HTTP tourneeId={}", event.codeTms());
        } catch (RestClientException e) {
            // Résilience : svc-tournee peut être éteint pendant les tests
            log.warn("[DevEventBridge] Echec HTTP vers svc-tournee tourneeId={} — {} (lancement BC-07 non annule)",
                    event.codeTms(), e.getMessage());
        }
    }
}
