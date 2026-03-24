package com.docapost.supervision.domain.service;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;

import java.time.Duration;
import java.time.Instant;

/**
 * Service de domaine — RisqueDetector (BC-03 Supervision — US-013)
 *
 * Évalue si une VueTournee est à risque de retard.
 * Critère : temps écoulé depuis derniereActivite > seuilInactiviteMin
 *           ET tous les colis ne sont pas traités.
 *
 * Invariants :
 * - Une tournée CLOTUREE ne peut jamais être à risque.
 * - Une tournée avec 0 colis (colisTotal = 0) n'est jamais à risque.
 * - derniereActivite null → pas à risque (tournée pas encore démarrée).
 *
 * Source : US-013 — "Alerte tournée à risque"
 */
public class RisqueDetector {

    private final int seuilInactiviteMin;

    public RisqueDetector(int seuilInactiviteMin) {
        this.seuilInactiviteMin = seuilInactiviteMin;
    }

    /**
     * Évalue si une VueTournee est à risque.
     *
     * @param tournee la vue de la tournée à évaluer
     * @return true si la tournée est à risque, false sinon
     */
    public boolean estARisque(VueTournee tournee) {
        if (tournee.getStatut() == StatutTourneeVue.CLOTUREE) {
            return false;
        }
        if (tournee.getColisTotal() == 0 || tournee.getPourcentage() >= 100) {
            return false;
        }
        if (tournee.getDerniereActivite() == null) {
            return false;
        }
        Duration inactivite = Duration.between(tournee.getDerniereActivite(), Instant.now());
        return inactivite.toMinutes() >= seuilInactiviteMin;
    }

    public int getSeuilInactiviteMin() {
        return seuilInactiviteMin;
    }
}
