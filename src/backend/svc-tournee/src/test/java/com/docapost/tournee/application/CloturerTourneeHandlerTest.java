package com.docapost.tournee.application;

import com.docapost.tournee.application.RecapitulatifTourneeResult;
import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires TDD — Application layer : CloturerTourneeHandler
 * US-007 — Cloture de tournee
 */
@ExtendWith(MockitoExtension.class)
class CloturerTourneeHandlerTest {

    @Mock
    private TourneeRepository tourneeRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CloturerTourneeHandler handler;

    private TourneeId tourneeId;
    private LivreurId livreurId;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        tourneeId = new TourneeId("tournee-001");
        livreurId = new LivreurId("livreur-001");
        today = LocalDate.now();
    }

    @Test
    @DisplayName("handle() cloture la tournee si tous les colis sont traites")
    void handle_cloture_tournee_si_tous_traites() {
        Tournee tournee = uneTourneeTerminee();
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any(Tournee.class))).thenReturn(tournee);

        CloturerTourneeCommand command = new CloturerTourneeCommand(tourneeId);
        RecapitulatifTourneeResult recap = handler.handle(command);

        assertThat(recap).isNotNull();
        assertThat(recap.tourneeId()).isEqualTo(tourneeId.value());
        assertThat(recap.colisTotal()).isEqualTo(3);
        assertThat(recap.colisLivres()).isEqualTo(2);
        assertThat(recap.colisEchecs()).isEqualTo(1);
        assertThat(recap.colisARepresenter()).isEqualTo(0);
    }

    @Test
    @DisplayName("handle() sauvegarde la tournee avec statut CLOTUREE")
    void handle_sauvegarde_tournee_cloturee() {
        Tournee tournee = uneTourneeTerminee();
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any(Tournee.class))).thenReturn(tournee);

        CloturerTourneeCommand command = new CloturerTourneeCommand(tourneeId);
        handler.handle(command);

        verify(tourneeRepository).save(tournee);
        assertThat(tournee.getStatut()).isEqualTo(StatutTournee.CLOTUREE);
    }

    @Test
    @DisplayName("handle() emet l'evenement TourneeCloturee via l'eventPublisher")
    void handle_emet_event_tourneecloturee() {
        Tournee tournee = uneTourneeTerminee();
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any(Tournee.class))).thenReturn(tournee);

        CloturerTourneeCommand command = new CloturerTourneeCommand(tourneeId);
        handler.handle(command);

        verify(eventPublisher, atLeastOnce()).publishEvent(any(Object.class));
    }

    @Test
    @DisplayName("handle() leve TourneeNotFoundException si la tournee n'existe pas")
    void handle_leve_exception_si_tournee_introuvable() {
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.empty());

        CloturerTourneeCommand command = new CloturerTourneeCommand(tourneeId);

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeNotFoundException.class);
    }

    @Test
    @DisplayName("handle() leve TourneeInvariantException si des colis sont encore a livrer")
    void handle_leve_exception_si_colis_encore_a_livrer() {
        Tournee tourneeNonTerminee = uneTourneeNonTerminee();
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tourneeNonTerminee));

        CloturerTourneeCommand command = new CloturerTourneeCommand(tourneeId);

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeInvariantException.class)
                .hasMessageContaining("a livrer");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Tournee uneTourneeTerminee() {
        Colis livre1 = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Colis livre2 = new Colis(
                new ColisId("c-2"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Colis echec = new Colis(
                new ColisId("c-3"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of()
        );
        return new Tournee(tourneeId, livreurId, today, List.of(livre1, livre2, echec), StatutTournee.DEMARREE);
    }

    private Tournee uneTourneeNonTerminee() {
        Colis livre = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Colis aLivrer = new Colis(
                new ColisId("c-2"), tourneeId,
                StatutColis.A_LIVRER, uneAdresse(), unDestinataire(), List.of()
        );
        return new Tournee(tourneeId, livreurId, today, List.of(livre, aLivrer), StatutTournee.DEMARREE);
    }

    private Adresse uneAdresse() {
        return new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A");
    }

    private Destinataire unDestinataire() {
        return new Destinataire("M. Dupont", "0601020304");
    }
}
