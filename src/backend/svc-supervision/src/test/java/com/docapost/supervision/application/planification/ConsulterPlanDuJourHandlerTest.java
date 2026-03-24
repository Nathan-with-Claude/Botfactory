package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests TDD — ConsulterPlanDuJourHandler (US-021)
 */
@ExtendWith(MockitoExtension.class)
class ConsulterPlanDuJourHandlerTest {

    @Mock
    private TourneePlanifieeRepository repository;

    private ConsulterPlanDuJourHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ConsulterPlanDuJourHandler(repository);
    }

    @Test
    @DisplayName("retourne toutes les tournées du jour sans filtre")
    void handle_retourne_toutes_les_tournees_sans_filtre() {
        LocalDate today = LocalDate.now();
        List<TourneePlanifiee> tournees = List.of(
                tourneeNonAffectee("tp-001", "T-201", today),
                tourneeNonAffectee("tp-002", "T-202", today)
        );
        when(repository.findByDate(today)).thenReturn(tournees);

        List<TourneePlanifiee> result = handler.handle(ConsulterPlanDuJourQuery.pourAujourdHui());

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCodeTms()).isEqualTo("T-201");
    }

    @Test
    @DisplayName("retourne uniquement les tournées NON_AFFECTEES avec filtre")
    void handle_filtre_par_statut_non_affectee() {
        LocalDate today = LocalDate.now();
        List<TourneePlanifiee> nonAffectees = List.of(
                tourneeNonAffectee("tp-001", "T-201", today)
        );
        when(repository.findByDateAndStatut(today, StatutAffectation.NON_AFFECTEE)).thenReturn(nonAffectees);

        List<TourneePlanifiee> result = handler.handle(
                new ConsulterPlanDuJourQuery(today, StatutAffectation.NON_AFFECTEE)
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatut()).isEqualTo(StatutAffectation.NON_AFFECTEE);
    }

    @Test
    @DisplayName("retourne une liste vide si aucune tournée pour la date")
    void handle_retourne_liste_vide_si_pas_de_tournee() {
        LocalDate today = LocalDate.now();
        when(repository.findByDate(today)).thenReturn(List.of());

        List<TourneePlanifiee> result = handler.handle(ConsulterPlanDuJourQuery.pourAujourdHui());

        assertThat(result).isEmpty();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeNonAffectee(String id, String codeTms, LocalDate date) {
        return new TourneePlanifiee(
                id, codeTms, date, 30,
                List.of(new ZoneTournee("Lyon 3e", 30)),
                List.of(),
                List.of(),
                Instant.now()
        );
    }
}
