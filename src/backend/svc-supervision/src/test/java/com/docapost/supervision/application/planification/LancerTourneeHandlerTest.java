package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.events.TourneeLancee;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — LancerTourneeHandler (US-024)
 */
@ExtendWith(MockitoExtension.class)
class LancerTourneeHandlerTest {

    @Mock
    private TourneePlanifieeRepository repository;

    private LancerTourneeHandler handler;

    @BeforeEach
    void setUp() {
        handler = new LancerTourneeHandler(repository);
    }

    @Test
    @DisplayName("lance correctement une tournée AFFECTEE et retourne TourneeLancee")
    void handle_lance_tournee_affectee_et_retourne_event() {
        TourneePlanifiee tournee = tourneeAffectee("tp-002", "T-202");
        when(repository.findById("tp-002")).thenReturn(Optional.of(tournee));

        TourneeLancee event = handler.handle(new LancerTourneeCommand("tp-002", "superviseur-001"));

        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.LANCEE);
        assertThat(event.tourneePlanifieeId()).isEqualTo("tp-002");
        assertThat(event.codeTms()).isEqualTo("T-202");
        assertThat(event.livreurId()).isEqualTo("livreur-001");
        verify(repository).save(tournee);
    }

    @Test
    @DisplayName("lève PlanificationInvariantException si la tournée est NON_AFFECTEE")
    void handle_leve_exception_si_tournee_non_affectee() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-001", "T-201");
        when(repository.findById("tp-001")).thenReturn(Optional.of(tournee));

        assertThatThrownBy(() -> handler.handle(new LancerTourneeCommand("tp-001", "superviseur-001")))
                .isInstanceOf(PlanificationInvariantException.class)
                .hasMessageContaining("AFFECTEE");
    }

    @Test
    @DisplayName("lève TourneePlanifieeNotFoundException si tournée introuvable")
    void handle_leve_not_found_si_tournee_introuvable() {
        when(repository.findById("tp-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(new LancerTourneeCommand("tp-inconnu", "superviseur-001")))
                .isInstanceOf(TourneePlanifieeNotFoundException.class);
    }

    @Test
    @DisplayName("lancerToutesLesTourneesAffectees retourne le nombre de tournées lancées")
    void lancer_toutes_les_tournees_affectees_retourne_le_nombre_lance() {
        List<TourneePlanifiee> affectees = List.of(
                tourneeAffectee("tp-002", "T-202"),
                tourneeAffectee("tp-003", "T-203")
        );
        when(repository.findByDateAndStatut(LocalDate.now(), StatutAffectation.AFFECTEE)).thenReturn(affectees);

        int nbLancees = handler.lancerToutesLesTourneesAffectees("superviseur-001");

        assertThat(nbLancees).isEqualTo(2);
        verify(repository, times(2)).save(any());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeNonAffectee(String id, String codeTms) {
        return new TourneePlanifiee(
                id, codeTms, LocalDate.now(), 30,
                List.of(new ZoneTournee("Lyon 3e", 30)),
                List.of(), List.of(),
                Instant.now()
        );
    }

    private TourneePlanifiee tourneeAffectee(String id, String codeTms) {
        TourneePlanifiee tournee = new TourneePlanifiee(
                id, codeTms, LocalDate.now(), 30,
                List.of(new ZoneTournee("Lyon 3e", 30)),
                List.of(), List.of(),
                Instant.now(),
                StatutAffectation.AFFECTEE,
                "livreur-001", "Pierre Morel", "VH-07",
                Instant.now(), null, false
        );
        return tournee;
    }
}
