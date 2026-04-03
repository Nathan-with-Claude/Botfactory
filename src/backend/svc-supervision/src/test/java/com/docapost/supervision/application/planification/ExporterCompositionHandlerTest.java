package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.events.CompositionExportee;
import com.docapost.supervision.domain.planification.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

/**
 * Tests TDD — ExporterCompositionHandler (US-028)
 *
 * Scénarios couverts :
 * - SC1 : l'event CompositionExportee est émis avec les bons attributs
 * - SC2 : la tournée est sauvegardée après émission de l'event
 * - SC3 : exception si tournée introuvable
 * - SC4 : invariant — le statut de la tournée n'est pas modifié (lecture pure)
 *
 * Source : US-028
 */
class ExporterCompositionHandlerTest {

    private com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository repository;
    private ExporterCompositionHandler handler;

    @BeforeEach
    void setUp() {
        repository = mock(com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository.class);
        handler = new ExporterCompositionHandler(repository);
    }

    // ─── SC1 : l'event CompositionExportee est émis ───────────────────────────

    @Test
    @DisplayName("SC1 — tracerExportComposition émet CompositionExportee avec les bons attributs")
    void handle_emet_CompositionExportee_avec_tourneeId_et_superviseurId() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-203", "T-203");
        when(repository.findById("tp-203")).thenReturn(Optional.of(tournee));

        // Capture l'agrégat au moment du save() — avant clearEvenements()
        ArgumentCaptor<TourneePlanifiee> captor = ArgumentCaptor.forClass(TourneePlanifiee.class);
        doAnswer(invocation -> {
            TourneePlanifiee saved = invocation.getArgument(0);
            List<Object> evenements = saved.getEvenements();
            assertThat(evenements).hasSize(1);
            assertThat(evenements.get(0)).isInstanceOf(CompositionExportee.class);
            CompositionExportee event = (CompositionExportee) evenements.get(0);
            assertThat(event.tourneePlanifieeId()).isEqualTo("tp-203");
            assertThat(event.codeTms()).isEqualTo("T-203");
            assertThat(event.superviseurId()).isEqualTo("superviseur-001");
            assertThat(event.exporteeLe()).isNotNull();
            return null;
        }).when(repository).save(any());

        handler.handle(new ExporterCompositionCommand("tp-203", "superviseur-001"));

        verify(repository).save(captor.capture());
    }

    // ─── SC2 : la tournée est sauvegardée ─────────────────────────────────────

    @Test
    @DisplayName("SC2 — la tournée est sauvegardée après tracerExportComposition")
    void handle_sauvegarde_la_tournee() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-203", "T-203");
        when(repository.findById("tp-203")).thenReturn(Optional.of(tournee));

        handler.handle(new ExporterCompositionCommand("tp-203", "superviseur-001"));

        verify(repository, times(1)).save(tournee);
    }

    // ─── SC3 : exception si tournée introuvable ───────────────────────────────

    @Test
    @DisplayName("SC3 — TourneePlanifieeNotFoundException si tournée absente du repository")
    void handle_leve_TourneePlanifieeNotFoundException_si_introuvable() {
        when(repository.findById("tp-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                handler.handle(new ExporterCompositionCommand("tp-inconnu", "superviseur-001"))
        ).isInstanceOf(TourneePlanifieeNotFoundException.class);
    }

    // ─── SC4 : statut inchangé (lecture pure) ─────────────────────────────────

    @Test
    @DisplayName("SC4 — le statut de la tournée n'est pas modifié (opération de lecture pure)")
    void handle_ne_modifie_pas_le_statut_de_la_tournee() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-203", "T-203");
        StatutAffectation statutAvant = tournee.getStatut();
        when(repository.findById("tp-203")).thenReturn(Optional.of(tournee));

        handler.handle(new ExporterCompositionCommand("tp-203", "superviseur-001"));

        assertThat(tournee.getStatut()).isEqualTo(statutAvant);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeNonAffectee(String id, String codeTms) {
        return new TourneePlanifiee(
                id, codeTms, LocalDate.now(), 20,
                List.of(new ZoneTournee("Lyon 8e", 20)),
                List.of(new ContrainteHoraire("Avant 10h", 5)),
                List.of(),
                Instant.now()
        );
    }
}
