package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.repository.TourneeRepository;
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
 * Tests unitaires — Use case : DeclarerEchecLivraisonHandler (US-005)
 *
 * Vérifie :
 * - Délégation à la Tournée (aggregate), pas de logique métier dans le handler
 * - Sauvegarde de la Tournée après la déclaration
 * - Propagation des exceptions domaine (TourneeNotFoundException, TourneeInvariantException)
 * - ColisId inconnu → ColisNotFoundException
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("US-005 — DeclarerEchecLivraisonHandler")
class DeclarerEchecLivraisonHandlerTest {

    @Mock
    private TourneeRepository tourneeRepository;

    @InjectMocks
    private DeclarerEchecLivraisonHandler handler;

    private static final TourneeId TOURNEE_ID = new TourneeId("tournee-001");
    private static final LivreurId LIVREUR_ID = new LivreurId("livreur-001");

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Tournee uneTourneeAvecUnColis(String colisId, StatutColis statut) {
        Colis colis = new Colis(
                new ColisId(colisId),
                TOURNEE_ID,
                statut,
                new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of()
        );
        return new Tournee(TOURNEE_ID, LIVREUR_ID, LocalDate.now(), List.of(colis), StatutTournee.DEMARREE);
    }

    // ─── Tests nominaux ──────────────────────────────────────────────────────

    @Test
    @DisplayName("handle — déclare l'échec et sauvegarde la tournée")
    void handle_declareEchec_et_sauvegarde() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);
        when(tourneeRepository.findById(TOURNEE_ID)).thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DeclarerEchecLivraisonCommand command = new DeclarerEchecLivraisonCommand(
                TOURNEE_ID,
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        );

        Colis result = handler.handle(command);

        assertThat(result.getStatut()).isEqualTo(StatutColis.ECHEC);
        assertThat(result.getMotifNonLivraison()).isEqualTo(MotifNonLivraison.ABSENT);
        assertThat(result.getDisposition()).isEqualTo(Disposition.A_REPRESENTER);
        verify(tourneeRepository).save(tournee);
    }

    @Test
    @DisplayName("handle — lève TourneeNotFoundException si tournée introuvable")
    void handle_tournee_introuvable_leve_exception() {
        when(tourneeRepository.findById(TOURNEE_ID)).thenReturn(Optional.empty());

        DeclarerEchecLivraisonCommand command = new DeclarerEchecLivraisonCommand(
                TOURNEE_ID,
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeNotFoundException.class);

        verify(tourneeRepository, never()).save(any());
    }

    @Test
    @DisplayName("handle — lève ColisNotFoundException si colis introuvable dans la tournée")
    void handle_colis_introuvable_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);
        when(tourneeRepository.findById(TOURNEE_ID)).thenReturn(Optional.of(tournee));

        DeclarerEchecLivraisonCommand command = new DeclarerEchecLivraisonCommand(
                TOURNEE_ID,
                new ColisId("colis-INCONNU"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(ColisNotFoundException.class);

        verify(tourneeRepository, never()).save(any());
    }

    @Test
    @DisplayName("handle — lève TourneeInvariantException si colis déjà en ECHEC")
    void handle_colis_deja_en_echec_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.ECHEC);
        when(tourneeRepository.findById(TOURNEE_ID)).thenReturn(Optional.of(tournee));

        DeclarerEchecLivraisonCommand command = new DeclarerEchecLivraisonCommand(
                TOURNEE_ID,
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(com.docapost.tournee.domain.model.TourneeInvariantException.class);

        verify(tourneeRepository, never()).save(any());
    }

    @Test
    @DisplayName("handle — note optionnelle transmise jusqu'à l'event")
    void handle_avec_note_optionnelle() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);
        when(tourneeRepository.findById(TOURNEE_ID)).thenReturn(Optional.of(tournee));
        when(tourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DeclarerEchecLivraisonCommand command = new DeclarerEchecLivraisonCommand(
                TOURNEE_ID,
                new ColisId("colis-001"),
                MotifNonLivraison.ACCES_IMPOSSIBLE,
                Disposition.RETOUR_DEPOT,
                "Code d'accès non fourni"
        );

        Colis result = handler.handle(command);
        assertThat(result.getStatut()).isEqualTo(StatutColis.ECHEC);
    }
}
