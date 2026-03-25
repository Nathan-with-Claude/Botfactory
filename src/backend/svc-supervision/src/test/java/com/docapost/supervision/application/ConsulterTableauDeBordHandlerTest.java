package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.TableauDeBord;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests TDD — ConsulterTableauDeBordHandler (US-011)
 */
@ExtendWith(MockitoExtension.class)
class ConsulterTableauDeBordHandlerTest {

    @Mock
    private VueTourneeRepository vueTourneeRepository;

    private ConsulterTableauDeBordHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ConsulterTableauDeBordHandler(vueTourneeRepository);
    }

    @Test
    @DisplayName("retourne le tableau de bord complet sans filtre")
    void handle_retourne_tableau_complet_sans_filtre() {
        List<VueTournee> tournees = List.of(
                vueTourneeEnCours("t-001", "Pierre", 3, 10),
                vueTourneeEnCours("t-002", "Marie", 7, 10),
                vueTourneeARisque("t-003", "Jean", 2, 12)
        );
        when(vueTourneeRepository.findAll()).thenReturn(tournees);

        TableauDeBord tableau = handler.handle(ConsulterTableauDeBordQuery.sansFiltre());

        assertThat(tableau.tournees()).hasSize(3);
        assertThat(tableau.actives()).isEqualTo(2);
        assertThat(tableau.aRisque()).isEqualTo(1);
        assertThat(tableau.cloturees()).isEqualTo(0);
    }

    @Test
    @DisplayName("retourne uniquement les tournées A_RISQUE avec filtre")
    void handle_filtre_par_statut_a_risque() {
        List<VueTournee> aRisque = List.of(
                vueTourneeARisque("t-003", "Jean", 2, 12)
        );
        when(vueTourneeRepository.findByStatut(StatutTourneeVue.A_RISQUE)).thenReturn(aRisque);

        ConsulterTableauDeBordQuery query = new ConsulterTableauDeBordQuery(StatutTourneeVue.A_RISQUE);
        TableauDeBord tableau = handler.handle(query);

        assertThat(tableau.tournees()).hasSize(1);
        assertThat(tableau.aRisque()).isEqualTo(1);
        assertThat(tableau.actives()).isEqualTo(0);
        assertThat(tableau.tournees().get(0).getTourneeId()).isEqualTo("t-003");
    }

    @Test
    @DisplayName("retourne un tableau vide si aucune tournée")
    void handle_retourne_tableau_vide_si_aucune_tournee() {
        when(vueTourneeRepository.findAll()).thenReturn(List.of());

        TableauDeBord tableau = handler.handle(ConsulterTableauDeBordQuery.sansFiltre());

        assertThat(tableau.tournees()).isEmpty();
        assertThat(tableau.actives()).isEqualTo(0);
        assertThat(tableau.aRisque()).isEqualTo(0);
        assertThat(tableau.cloturees()).isEqualTo(0);
    }

    @Test
    @DisplayName("calcule le pourcentage correctement dans TableauDeBord")
    void tableauDeBord_calcule_compteurs_correctement() {
        List<VueTournee> tournees = List.of(
                vueTourneeEnCours("t-001", "P", 5, 10),
                vueTourneeCloturee("t-002", "M", 10, 10),
                vueTourneeCloturee("t-003", "J", 8, 8)
        );
        when(vueTourneeRepository.findAll()).thenReturn(tournees);

        TableauDeBord tableau = handler.handle(ConsulterTableauDeBordQuery.sansFiltre());

        assertThat(tableau.actives()).isEqualTo(1);
        assertThat(tableau.cloturees()).isEqualTo(2);
        assertThat(tableau.aRisque()).isEqualTo(0);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private VueTournee vueTourneeEnCours(String id, String nom, int traites, int total) {
        return new VueTournee(id, nom, traites, total, StatutTourneeVue.EN_COURS, Instant.now());
    }

    private VueTournee vueTourneeARisque(String id, String nom, int traites, int total) {
        return new VueTournee(id, nom, traites, total, StatutTourneeVue.A_RISQUE, Instant.now());
    }

    private VueTournee vueTourneeCloturee(String id, String nom, int traites, int total) {
        return new VueTournee(id, nom, traites, total, StatutTourneeVue.CLOTUREE, Instant.now());
    }
}
