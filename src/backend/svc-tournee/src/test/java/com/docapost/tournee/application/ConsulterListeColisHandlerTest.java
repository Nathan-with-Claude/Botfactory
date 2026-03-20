package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires TDD — Application layer : ConsulterListeColisHandler
 */
@ExtendWith(MockitoExtension.class)
class ConsulterListeColisHandlerTest {

    @Mock
    private TourneeRepository tourneeRepository;

    @InjectMocks
    private ConsulterListeColisHandler handler;

    private LivreurId livreurId;
    private TourneeId tourneeId;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        livreurId = new LivreurId("livreur-001");
        tourneeId = new TourneeId("tournee-001");
        today = LocalDate.now();
    }

    @Test
    @DisplayName("handle() retourne la tournee chargee depuis le repository")
    void handle_retourne_tournee() {
        Tournee tournee = uneTourneeAvecCinqColis();
        when(tourneeRepository.findByLivreurIdAndDate(livreurId, today))
                .thenReturn(Optional.of(tournee));

        ConsulterListeColisCommand command = new ConsulterListeColisCommand(livreurId, today);
        Tournee result = handler.handle(command);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(tourneeId);
        assertThat(result.getColis()).hasSize(5);
    }

    @Test
    @DisplayName("handle() appelle demarrer() sur la tournee (idempotent)")
    void handle_appelle_demarrer() {
        Tournee tournee = uneTourneeAvecCinqColis();
        when(tourneeRepository.findByLivreurIdAndDate(livreurId, today))
                .thenReturn(Optional.of(tournee));

        ConsulterListeColisCommand command = new ConsulterListeColisCommand(livreurId, today);
        Tournee result = handler.handle(command);

        assertThat(result.getStatut()).isEqualTo(StatutTournee.DEMARREE);
    }

    @Test
    @DisplayName("handle() sauvegarde la tournee apres demarrage")
    void handle_sauvegarde_tournee() {
        Tournee tournee = uneTourneeAvecCinqColis();
        when(tourneeRepository.findByLivreurIdAndDate(livreurId, today))
                .thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any(Tournee.class))).thenReturn(tournee);

        ConsulterListeColisCommand command = new ConsulterListeColisCommand(livreurId, today);
        handler.handle(command);

        verify(tourneeRepository).save(tournee);
    }

    @Test
    @DisplayName("handle() leve TourneeNotFoundException si aucune tournee n'est trouvee")
    void handle_leve_exception_si_pas_de_tournee() {
        when(tourneeRepository.findByLivreurIdAndDate(livreurId, today))
                .thenReturn(Optional.empty());

        ConsulterListeColisCommand command = new ConsulterListeColisCommand(livreurId, today);

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeNotFoundException.class);
    }

    @Test
    @DisplayName("handle() emet les domain events si premiere consultation")
    void handle_emet_domain_events_au_premier_acces() {
        Tournee tournee = uneTourneeAvecCinqColis();
        when(tourneeRepository.findByLivreurIdAndDate(livreurId, today))
                .thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any(Tournee.class))).thenReturn(tournee);

        ConsulterListeColisCommand command = new ConsulterListeColisCommand(livreurId, today);
        Tournee result = handler.handle(command);

        // La tournee doit avoir des events (TourneeDemarree) apres le premier acces
        assertThat(result.getDomainEvents()).isNotEmpty();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Tournee uneTourneeAvecCinqColis() {
        List<Colis> colis = List.of(
                unColis("c-1"),
                unColis("c-2"),
                unColis("c-3"),
                unColis("c-4"),
                unColis("c-5")
        );
        return new Tournee(tourneeId, livreurId, today, colis, StatutTournee.CHARGEE);
    }

    private Colis unColis(String id) {
        return new Colis(
                new ColisId(id),
                tourneeId,
                StatutColis.A_LIVRER,
                new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of()
        );
    }
}
