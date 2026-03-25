package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.domain.service.RisqueDetector;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — DetecterTourneesARisqueHandler (US-013)
 */
@ExtendWith(MockitoExtension.class)
class DetecterTourneesARisqueHandlerTest {

    @Mock
    private VueTourneeRepository vueTourneeRepository;

    @Mock
    private RisqueDetector risqueDetector;

    @Mock
    private TableauDeBordBroadcaster broadcaster;

    private DetecterTourneesARisqueHandler handler;

    @BeforeEach
    void setUp() {
        handler = new DetecterTourneesARisqueHandler(vueTourneeRepository, risqueDetector, broadcaster);
    }

    @Test
    @DisplayName("passe EN_COURS à A_RISQUE si détectée comme à risque, puis broadcast")
    void detecter_passe_tournee_en_cours_a_risque_si_detectee() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 2, 10,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(2000));
        when(vueTourneeRepository.findAllEnCours()).thenReturn(List.of(tournee));
        when(risqueDetector.estARisque(tournee)).thenReturn(true);

        handler.detecter();

        assertThat(tournee.getStatut()).isEqualTo(StatutTourneeVue.A_RISQUE);
        verify(vueTourneeRepository).save(tournee);
        verify(broadcaster).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("normalise A_RISQUE → EN_COURS si risque résorbé, puis broadcast")
    void detecter_normalise_tournee_a_risque_si_risque_resolu() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 8, 10,
                StatutTourneeVue.A_RISQUE, Instant.now().minusSeconds(100));
        when(vueTourneeRepository.findAllEnCours()).thenReturn(List.of(tournee));
        when(risqueDetector.estARisque(tournee)).thenReturn(false);

        handler.detecter();

        assertThat(tournee.getStatut()).isEqualTo(StatutTourneeVue.EN_COURS);
        verify(vueTourneeRepository).save(tournee);
        verify(broadcaster).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("ne change pas statut ni ne sauvegarde si EN_COURS et pas à risque")
    void detecter_ne_change_pas_si_en_cours_et_pas_risque() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 8, 10,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(60));
        when(vueTourneeRepository.findAllEnCours()).thenReturn(List.of(tournee));
        when(risqueDetector.estARisque(tournee)).thenReturn(false);

        handler.detecter();

        assertThat(tournee.getStatut()).isEqualTo(StatutTourneeVue.EN_COURS);
        verify(vueTourneeRepository, never()).save(any());
        verify(broadcaster, never()).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("ne save pas si A_RISQUE reste à risque, mais ne broadcast pas non plus")
    void detecter_ne_sauvegarde_pas_si_a_risque_reste_a_risque() {
        VueTournee tournee = new VueTournee("t-001", "Pierre", 2, 10,
                StatutTourneeVue.A_RISQUE, Instant.now().minusSeconds(2000));
        when(vueTourneeRepository.findAllEnCours()).thenReturn(List.of(tournee));
        when(risqueDetector.estARisque(tournee)).thenReturn(true);

        handler.detecter();

        assertThat(tournee.getStatut()).isEqualTo(StatutTourneeVue.A_RISQUE);
        verify(vueTourneeRepository, never()).save(any());
        verify(broadcaster, never()).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("broadcast une seule fois même si plusieurs tournées changent")
    void detecter_broadcast_une_seule_fois_si_plusieurs_changements() {
        VueTournee t1 = new VueTournee("t-001", "Pierre", 2, 10,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(2000));
        VueTournee t2 = new VueTournee("t-002", "Marie", 3, 12,
                StatutTourneeVue.EN_COURS, Instant.now().minusSeconds(2500));
        when(vueTourneeRepository.findAllEnCours()).thenReturn(List.of(t1, t2));
        when(risqueDetector.estARisque(t1)).thenReturn(true);
        when(risqueDetector.estARisque(t2)).thenReturn(true);

        handler.detecter();

        verify(broadcaster, times(1)).broadcastTableauDeBord();
    }
}
