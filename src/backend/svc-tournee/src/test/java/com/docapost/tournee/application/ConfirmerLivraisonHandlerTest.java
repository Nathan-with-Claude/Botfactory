package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.preuves.model.*;
import com.docapost.tournee.domain.preuves.repository.PreuveLivraisonRepository;
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
 * Tests unitaires TDD — Application layer : ConfirmerLivraisonHandler (US-008 + US-009)
 *
 * Verifie :
 * - Cree la PreuveLivraison de type SIGNATURE (US-008)
 * - Cree la PreuveLivraison de type PHOTO, TIERS, DEPOT (US-009)
 * - Met a jour le statut du Colis a LIVRE
 * - Sauvegarde la preuve et la tournee
 * - Leve TourneeNotFoundException si la tournee n'existe pas
 * - Leve ColisNotFoundException si le colis n'appartient pas a la tournee
 * - Leve PreuveLivraisonInvariantException si les donnees sont invalides
 */
@ExtendWith(MockitoExtension.class)
class ConfirmerLivraisonHandlerTest {

    @Mock
    private TourneeRepository tourneeRepository;

    @Mock
    private PreuveLivraisonRepository preuveLivraisonRepository;

    @InjectMocks
    private ConfirmerLivraisonHandler handler;

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

    // ─── US-008 : Signature ───────────────────────────────────────────────────

    @Test
    @DisplayName("US-008 SC1 : handle() avec SIGNATURE cree la preuve et passe le colis a LIVRE")
    void handle_signature_cree_preuve_et_livre_colis() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourSignature(
                tourneeId, colisId, "sig_base64".getBytes(), null
        );

        PreuveLivraison preuve = handler.handle(command);

        assertThat(preuve).isNotNull();
        assertThat(preuve.getType()).isEqualTo(TypePreuve.SIGNATURE);
        assertThat(preuve.getColisId()).isEqualTo(colisId);

        // Le colis doit etre LIVRE
        Colis colis = tournee.getColis().stream()
                .filter(c -> c.getId().equals(colisId)).findFirst().orElseThrow();
        assertThat(colis.getStatut()).isEqualTo(StatutColis.LIVRE);

        // La preuve doit etre sauvegardee
        verify(preuveLivraisonRepository).save(any(PreuveLivraison.class));
        // La tournee doit etre sauvegardee
        verify(tourneeRepository).save(any(Tournee.class));
    }

    @Test
    @DisplayName("US-008 SC4 : handle() en mode degrade GPS — preuve creee sans coordonnees")
    void handle_signature_mode_degrade_gps() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourSignature(
                tourneeId, colisId, "sig".getBytes(), null // GPS null
        );

        PreuveLivraison preuve = handler.handle(command);

        assertThat(preuve.getCoordonnees()).isNull();
        assertThat(preuve.isModeDegradeGps()).isTrue();
    }

    // ─── US-009 : Photo ──────────────────────────────────────────────────────

    @Test
    @DisplayName("US-009 SC1 : handle() avec PHOTO cree la preuve et livre le colis")
    void handle_photo_cree_preuve_et_livre_colis() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourPhoto(
                tourneeId, colisId,
                "photos/colis-001.jpg",
                "sha256:abc123",
                new Coordonnees(45.7, 4.8)
        );

        PreuveLivraison preuve = handler.handle(command);

        assertThat(preuve.getType()).isEqualTo(TypePreuve.PHOTO);
        assertThat(preuve.getPhotoPreuve().urlPhoto()).isEqualTo("photos/colis-001.jpg");
        verify(preuveLivraisonRepository).save(any());
        verify(tourneeRepository).save(any());
    }

    // ─── US-009 : Tiers ──────────────────────────────────────────────────────

    @Test
    @DisplayName("US-009 SC2 : handle() avec TIERS_IDENTIFIE cree la preuve et livre le colis")
    void handle_tiers_cree_preuve_et_livre_colis() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourTiers(
                tourneeId, colisId, "Mme Leroy", new Coordonnees(45.7, 4.8)
        );

        PreuveLivraison preuve = handler.handle(command);

        assertThat(preuve.getType()).isEqualTo(TypePreuve.TIERS_IDENTIFIE);
        assertThat(preuve.getTiersIdentifie().nomTiers()).isEqualTo("Mme Leroy");
    }

    // ─── US-009 : Depot securise ─────────────────────────────────────────────

    @Test
    @DisplayName("US-009 SC4 : handle() avec DEPOT_SECURISE cree la preuve et livre le colis")
    void handle_depot_securise_cree_preuve_et_livre_colis() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourDepotSecurise(
                tourneeId, colisId, "Boite aux lettres n°3", new Coordonnees(45.7, 4.8)
        );

        PreuveLivraison preuve = handler.handle(command);

        assertThat(preuve.getType()).isEqualTo(TypePreuve.DEPOT_SECURISE);
        assertThat(preuve.getDepotSecurise().description()).isEqualTo("Boite aux lettres n°3");
    }

    // ─── Cas d'erreur ────────────────────────────────────────────────────────

    @Test
    @DisplayName("handle() leve TourneeNotFoundException si la tournee n'existe pas")
    void handle_leve_exception_si_tournee_introuvable() {
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.empty());

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourSignature(
                tourneeId, colisId, "sig".getBytes(), null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeNotFoundException.class);

        verify(preuveLivraisonRepository, never()).save(any());
    }

    @Test
    @DisplayName("handle() leve ColisNotFoundException si le colis n'existe pas dans la tournee")
    void handle_leve_exception_si_colis_introuvable() {
        Tournee tournee = uneTourneeAvecColis(new ColisId("autre-colis"), StatutColis.A_LIVRER);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourSignature(
                tourneeId, colisId, "sig".getBytes(), null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(ColisNotFoundException.class);
    }

    @Test
    @DisplayName("handle() leve TourneeInvariantException si le colis est deja livre")
    void handle_leve_exception_si_colis_deja_livre() {
        Tournee tournee = uneTourneeAvecColis(colisId, StatutColis.LIVRE);
        when(tourneeRepository.findById(tourneeId)).thenReturn(Optional.of(tournee));

        ConfirmerLivraisonCommand command = ConfirmerLivraisonCommand.pourSignature(
                tourneeId, colisId, "sig".getBytes(), null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(TourneeInvariantException.class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Tournee uneTourneeAvecColis(ColisId id, StatutColis statut) {
        Colis colis = new Colis(
                id, tourneeId, statut,
                new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of()
        );
        return new Tournee(tourneeId, livreurId, today, List.of(colis), StatutTournee.DEMARREE);
    }
}
