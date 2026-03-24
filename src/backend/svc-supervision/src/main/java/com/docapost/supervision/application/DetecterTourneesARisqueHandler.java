package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.domain.service.RisqueDetector;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — Détecter les tournées à risque (US-013)
 *
 * Orchestration :
 * 1. Charge toutes les tournées EN_COURS et A_RISQUE.
 * 2. Pour chaque tournée :
 *    - EN_COURS et estARisque → signalerRisque() + save
 *    - A_RISQUE et !estARisque → normaliserStatut() + save
 *    - sinon → aucune action
 * 3. Si au moins un changement → broadcast WebSocket (une seule fois).
 *
 * Appelé par RisqueDetectorScheduler toutes les minutes.
 *
 * Source : US-013 — "Alerte tournée à risque"
 */
@Service
public class DetecterTourneesARisqueHandler {

    private final VueTourneeRepository vueTourneeRepository;
    private final RisqueDetector risqueDetector;
    private final TableauDeBordBroadcaster broadcaster;

    public DetecterTourneesARisqueHandler(
            VueTourneeRepository vueTourneeRepository,
            RisqueDetector risqueDetector,
            TableauDeBordBroadcaster broadcaster
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.risqueDetector = risqueDetector;
        this.broadcaster = broadcaster;
    }

    /**
     * Évalue et met à jour le statut de chaque tournée active.
     * Broadcast WebSocket si au moins un statut a changé.
     */
    public void detecter() {
        List<VueTournee> tournees = vueTourneeRepository.findAllEnCours();
        boolean changement = false;

        for (VueTournee tournee : tournees) {
            boolean aRisque = risqueDetector.estARisque(tournee);
            StatutTourneeVue statutAvant = tournee.getStatut();

            if (statutAvant == StatutTourneeVue.EN_COURS && aRisque) {
                tournee.signalerRisque();
                vueTourneeRepository.save(tournee);
                changement = true;
            } else if (statutAvant == StatutTourneeVue.A_RISQUE && !aRisque) {
                tournee.normaliserStatut();
                vueTourneeRepository.save(tournee);
                changement = true;
            }
        }

        if (changement) {
            broadcaster.broadcastTableauDeBord();
        }
    }
}
