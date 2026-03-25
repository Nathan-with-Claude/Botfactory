package com.docapost.oms.application;

import com.docapost.oms.domain.model.EvenementLivraison;
import com.docapost.oms.domain.model.StatutSynchronisation;
import com.docapost.oms.domain.repository.EvenementStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Handler US-017 — Synchroniser les événements en attente (outbox pattern).
 *
 * Déclenché par le OutboxPoller toutes les N secondes.
 * Pour chaque événement PENDING :
 *   1. Appel à l'OmsApiPort (ACL).
 *   2. Si succès → statut SYNCHRONIZED.
 *   3. Si échec → statut FAILED + compteur tentatives incrémenté.
 *
 * SLA : les événements sont transmis en < 30 secondes après création
 * (en mode connecté, avec intervalle de polling configuré à 10s).
 */
@Service
public class SynchroniserPendingEvenementsHandler {

    private static final Logger log = LoggerFactory.getLogger(SynchroniserPendingEvenementsHandler.class);

    private final EvenementStore evenementStore;
    private final OmsApiPort omsApiPort;

    public SynchroniserPendingEvenementsHandler(EvenementStore evenementStore, OmsApiPort omsApiPort) {
        this.evenementStore = evenementStore;
        this.omsApiPort = omsApiPort;
    }

    public void handle() {
        List<EvenementLivraison> enAttente = evenementStore.findEnAttente();

        if (enAttente.isEmpty()) {
            return;
        }

        log.info("OutboxPoller : {} événement(s) PENDING à synchroniser", enAttente.size());

        for (EvenementLivraison evenement : enAttente) {
            try {
                boolean succes = omsApiPort.transmettre(evenement);
                if (succes) {
                    evenementStore.updateStatut(
                            evenement.eventId(),
                            StatutSynchronisation.SYNCHRONIZED,
                            evenement.tentativesSynchronisation() + 1
                    );
                    log.info("Événement {} synchronisé avec l'OMS", evenement.eventId());
                } else {
                    evenementStore.updateStatut(
                            evenement.eventId(),
                            StatutSynchronisation.FAILED,
                            evenement.tentativesSynchronisation() + 1
                    );
                    log.warn("Échec synchronisation OMS pour événement {}", evenement.eventId());
                }
            } catch (Exception e) {
                evenementStore.updateStatut(
                        evenement.eventId(),
                        StatutSynchronisation.FAILED,
                        evenement.tentativesSynchronisation() + 1
                );
                log.error("Exception lors de la synchronisation OMS pour {}: {}", evenement.eventId(), e.getMessage());
            }
        }
    }
}
