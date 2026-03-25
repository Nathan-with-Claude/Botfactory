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
import static org.mockito.Mockito.*;

/**
 * Tests unitaires TDD — Application layer : ConsulterDetailColisHandler (US-004)
 *
 * Verifie :
 * - Retourne le bon Colis depuis la Tournee chargee
 * - Leve ColisNotFoundException si le colis n'existe pas dans la tournee
 * - Leve TourneeNotFoundException si la tournee n'existe pas
 */
@ExtendWith(MockitoExtension.class)
class ConsulterDetailColisHandlerTest {

    @Mock
    private TourneeRepository tourneeRepository;

    @InjectMocks
    private ConsulterDetailColisHandler handler;

    private TourneeId tourneeId;
    private LivreurId livreurId;
    private ColisId colisId;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        tourneeId = new TourneeId("tournee-001");
        livreurId = new LivreurId("livreur-001");
        colisId = new ColisId("colis-001");
        today = LocalDate.now();
    }

    @Test
    @DisplayName("handle() retourne le colis correspondant au colisId dans la tournee")
    void handle_retourne_le_colis_existant() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConsulterDetailColisCommand command = new ConsulterDetailColisCommand(tourneeId, colisId);
        Colis result = handler.handle(command);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(colisId);
        assertThat(result.getStatut()).isEqualTo(StatutColis.A_LIVRER);
    }

    @Test
    @DisplayName("handle() retourne les informations completes du colis : adresse, destinataire, contraintes")
    void handle_retourne_infos_completes_colis() {
        Contrainte contrainte = new Contrainte(TypeContrainte.HORAIRE, "Avant 14h00");
        Tournee tournee = uneTourneeAvecColisEtContrainte(colisId, List.of(contrainte));
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConsulterDetailColisCommand command = new ConsulterDetailColisCommand(tourneeId, colisId);
        Colis result = handler.handle(command);

        assertThat(result.getAdresseLivraison()).isNotNull();
        assertThat(result.getDestinataire()).isNotNull();
        assertThat(result.getContraintes()).hasSize(1);
        assertThat(result.getContraintes().get(0).type()).isEqualTo(TypeContrainte.HORAIRE);
    }

    @Test
    @DisplayName("handle() leve TourneeNotFoundException si la tournee n'existe pas")
    void handle_leve_exception_si_tournee_introuvable() {
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.empty());

        ConsulterDetailColisCommand command = new ConsulterDetailColisCommand(tourneeId, colisId);

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeNotFoundException.class);
    }

    @Test
    @DisplayName("handle() leve ColisNotFoundException si le colis n'existe pas dans la tournee")
    void handle_leve_exception_si_colis_introuvable() {
        Tournee tournee = uneTourneeAvecColis(new ColisId("autre-colis"), StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConsulterDetailColisCommand command = new ConsulterDetailColisCommand(tourneeId, colisId);

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(ColisNotFoundException.class);
    }

    @Test
    @DisplayName("handle() retourne le colis avec statut LIVRE (statut terminal visible)")
    void handle_retourne_colis_avec_statut_terminal() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.LIVRE);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConsulterDetailColisCommand command = new ConsulterDetailColisCommand(tourneeId, colisId);
        Colis result = handler.handle(command);

        assertThat(result.getStatut()).isEqualTo(StatutColis.LIVRE);
        assertThat(result.estTraite()).isTrue();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Tournee uneTourneeAvecColis(ColisId id, StatutColis statut) {
        return uneTourneeAvecColisEtContrainte(id, statut, List.of());
    }

    private Tournee uneTourneeAvecColisEtContrainte(ColisId id, List<Contrainte> contraintes) {
        return uneTourneeAvecColisEtContrainte(id, StatutColis.A_LIVRER, contraintes);
    }

    private Tournee uneTourneeAvecColisEtContrainte(ColisId id, StatutColis statut, List<Contrainte> contraintes) {
        Colis colis = new Colis(
                id,
                tourneeId,
                statut,
                new Adresse("12 Rue du Port", "Apt 3B", "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                contraintes
        );
        return new Tournee(tourneeId, livreurId, today, List.of(colis), StatutTournee.DEMARREE);
    }
}
