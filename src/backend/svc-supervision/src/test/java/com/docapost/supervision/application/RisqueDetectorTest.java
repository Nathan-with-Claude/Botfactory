package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.service.RisqueDetector;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests TDD — RisqueDetector (US-013)
 *
 * RisqueDetector détecte si une tournée EN_COURS est à risque selon
 * l'inactivité (temps écoulé depuis derniereActivite > seuilInactiviteMin).
 */
class RisqueDetectorTest {

    @Test
    @DisplayName("estARisque retourne true si inactivité > seuil et colis non tous traités")
    void estARisque_retourne_true_si_inactivite_superieure_seuil() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 2, 10,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(1800)); // 30 min
        RisqueDetector detector = new RisqueDetector(25); // seuil = 25 min

        assertThat(detector.estARisque(tournee)).isTrue();
    }

    @Test
    @DisplayName("estARisque retourne false si inactivité < seuil")
    void estARisque_retourne_false_si_inactivite_inferieure_seuil() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 2, 10,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(600)); // 10 min
        RisqueDetector detector = new RisqueDetector(25);

        assertThat(detector.estARisque(tournee)).isFalse();
    }

    @Test
    @DisplayName("estARisque retourne false si tous les colis sont traités")
    void estARisque_retourne_false_si_tous_colis_traites() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 10, 10,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(3600)); // 1h sans activité
        RisqueDetector detector = new RisqueDetector(25);

        assertThat(detector.estARisque(tournee)).isFalse();
    }

    @Test
    @DisplayName("estARisque retourne false si tournée déjà clôturée")
    void estARisque_retourne_false_si_tournee_cloturee() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 5, 10,
                StatutTourneeVue.CLOTUREE, Instant.now().minusSeconds(3600));
        RisqueDetector detector = new RisqueDetector(25);

        assertThat(detector.estARisque(tournee)).isFalse();
    }

    @Test
    @DisplayName("estARisque retourne true si tournée A_RISQUE et inactivité toujours > seuil")
    void estARisque_retourne_true_si_deja_a_risque_et_inactivite_continue() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 2, 10,
                StatutTourneeVue.A_RISQUE, Instant.now().minusSeconds(2000));
        RisqueDetector detector = new RisqueDetector(25);

        assertThat(detector.estARisque(tournee)).isTrue();
    }

    @Test
    @DisplayName("estARisque retourne false si derniereActivite est null")
    void estARisque_retourne_false_si_activite_nulle() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 0, 10,
                StatutTourneeVue.EN_COURS, null);
        RisqueDetector detector = new RisqueDetector(25);

        assertThat(detector.estARisque(tournee)).isFalse();
    }
}
