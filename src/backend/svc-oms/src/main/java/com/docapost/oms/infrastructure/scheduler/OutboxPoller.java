package com.docapost.oms.infrastructure.scheduler;

import com.docapost.oms.application.SynchroniserPendingEvenementsHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Outbox Poller — US-017 (rejeu automatique des événements en attente).
 *
 * Déclenché toutes les 10 secondes (oms.outbox.polling-delay-ms).
 * Délègue au SynchroniserPendingEvenementsHandler pour la logique de retry.
 *
 * SLA garanti : transmission OMS < 30 secondes après création de l'événement.
 */
@Component
public class OutboxPoller {

    private static final Logger log = LoggerFactory.getLogger(OutboxPoller.class);

    private final SynchroniserPendingEvenementsHandler handler;

    public OutboxPoller(SynchroniserPendingEvenementsHandler handler) {
        this.handler = handler;
    }

    @Scheduled(fixedDelayString = "${oms.outbox.polling-delay-ms:10000}")
    public void poll() {
        log.debug("OutboxPoller : déclenchement synchronisation OMS");
        handler.handle();
    }
}
