package com.docapost.tournee.infrastructure.supervision;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Infrastructure Adapter — SupervisionNotifier (US-032)
 *
 * Notifie svc-supervision des evenements livreurs de maniere asynchrone
 * (fire-and-forget). L'echec de la notification ne bloque pas la reponse livreur.
 *
 * Appelle POST {supervision.api.url}/api/supervision/internal/vue-tournee/events
 *
 * Resilience :
 * - 2 tentatives avec backoff de 500ms en cas d'echec reseau
 * - En cas d'echec definitif : log WARN avec eventId et type
 * - L'exception n'est jamais propagee au caller (fire-and-forget)
 *
 * Source : US-032 — "Synchroniser le read model supervision"
 */
@Component
public class SupervisionNotifier {

    private static final Logger log = LoggerFactory.getLogger(SupervisionNotifier.class);

    private static final String EVENTS_PATH = "/api/supervision/internal/vue-tournee/events";
    private static final int MAX_TENTATIVES = 2;
    private static final long BACKOFF_MS = 500L;

    private final RestTemplate restTemplate;
    private final String supervisionApiUrl;
    private final String internalSecret;

    public SupervisionNotifier(
            RestTemplate restTemplate,
            @Value("${supervision.api.url:http://localhost:8082}") String supervisionApiUrl,
            @Value("${internal.secret:}") String internalSecret
    ) {
        this.restTemplate = restTemplate;
        this.supervisionApiUrl = supervisionApiUrl;
        this.internalSecret = internalSecret;
    }

    /**
     * Notifie svc-supervision d'un evenement livreur de maniere asynchrone.
     * Fire-and-forget : la reponse livreur n'est pas bloquee.
     *
     * @param eventType  COLIS_LIVRE | ECHEC_DECLAREE | TOURNEE_CLOTUREE
     * @param tourneeId  identifiant de la tournee
     * @param livreurId  identifiant du livreur
     * @param colisId    identifiant du colis (null pour clôture)
     */
    public void notifierAsync(String eventType, String tourneeId, String livreurId, String colisId) {
        String eventId = UUID.randomUUID().toString();
        String horodatage = Instant.now().toString();
        String payload = buildPayload(eventId, eventType, tourneeId, livreurId, colisId, horodatage);

        CompletableFuture.runAsync(() ->
                envoyerPayloadAvecRetry(eventId, eventType, tourneeId, payload)
        );
    }

    /**
     * Notifie svc-supervision du démarrage d'une tournee avec son colisTotal.
     * Utilise un eventId stable ("start-{tourneeId}") pour garantir l'idempotence :
     * seul le premier appel crée la VueTournee dans supervision.
     *
     * @param tourneeId  identifiant de la tournee
     * @param livreurId  identifiant du livreur
     * @param colisTotal nombre total de colis de la tournee
     */
    public void notifierTourneeDemarree(String tourneeId, String livreurId, int colisTotal) {
        String eventId = "start-" + tourneeId; // stable → idempotence supervision
        String horodatage = Instant.now().toString();
        String colisIdJson = "null";
        String payload = String.format(
                "{\"eventId\":\"%s\",\"eventType\":\"TOURNEE_DEMARREE\",\"tourneeId\":\"%s\"," +
                "\"livreurId\":\"%s\",\"colisId\":%s,\"motif\":null,\"horodatage\":\"%s\",\"colisTotal\":%d}",
                eventId, tourneeId, livreurId, colisIdJson, horodatage, colisTotal
        );

        CompletableFuture.runAsync(() ->
                envoyerPayloadAvecRetry(eventId, "TOURNEE_DEMARREE", tourneeId, payload)
        );
    }

    /**
     * Envoie un payload JSON pré-construit a svc-supervision avec retry.
     * Log WARN en cas d'echec definitif.
     */
    private void envoyerPayloadAvecRetry(
            String eventId, String eventType, String tourneeId, String payload
    ) {
        String url = supervisionApiUrl + EVENTS_PATH;

        for (int tentative = 1; tentative <= MAX_TENTATIVES; tentative++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                if (internalSecret != null && !internalSecret.isBlank()) {
                    headers.set("X-Internal-Secret", internalSecret);
                }
                HttpEntity<String> entity = new HttpEntity<>(payload, headers);

                restTemplate.postForEntity(url, entity, Void.class);
                log.debug("Evenement {} ({}) notifie a svc-supervision (tentative {})",
                        eventId, eventType, tentative);
                return; // succes
            } catch (Exception e) {
                if (tentative < MAX_TENTATIVES) {
                    log.debug("Echec tentative {}/{} pour evenement {} ({}) : {} — retry dans {}ms",
                            tentative, MAX_TENTATIVES, eventId, eventType, e.getMessage(), BACKOFF_MS);
                    try {
                        Thread.sleep(BACKOFF_MS);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.warn("Echec definitif propagation evenement eventId={} type={} tourneeId={} : {}",
                            eventId, eventType, tourneeId, e.getMessage());
                }
            }
        }
    }

    /**
     * Construit le payload JSON de l'evenement a envoyer.
     */
    private String buildPayload(
            String eventId, String eventType, String tourneeId,
            String livreurId, String colisId, String horodatage
    ) {
        String colisIdJson = colisId != null ? "\"" + colisId + "\"" : "null";
        return String.format(
                "{\"eventId\":\"%s\",\"eventType\":\"%s\",\"tourneeId\":\"%s\"," +
                "\"livreurId\":\"%s\",\"colisId\":%s,\"motif\":null,\"horodatage\":\"%s\",\"colisTotal\":0}",
                eventId, eventType, tourneeId, livreurId, colisIdJson, horodatage
        );
    }
}
