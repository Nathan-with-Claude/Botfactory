package com.docapost.tournee.domain;

import com.docapost.tournee.domain.events.EchecLivraisonDeclare;
import com.docapost.tournee.domain.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests unitaires — US-005 : Déclarer un échec de livraison
 *
 * Couvre :
 * - Scénario 1 : transition A_LIVRER → ECHEC, Event EchecLivraisonDeclare émis
 * - Scénario 2 : motif obligatoire
 * - Scénario 3 : disposition obligatoire
 * - Scénario 4 : note optionnelle incluse dans l'event
 * - Scénario 5 : note trop longue (> 250 car.) → exception
 * - Invariant : colis déjà ECHEC ne peut pas repasser en ECHEC
 * - Invariant : colis LIVRE ne peut pas passer en ECHEC
 * - Invariant : transition correcte vers A_REPRESENTER si disposition = A_REPRESENTER (US à venir, mais la disposition est enregistrée)
 */
@DisplayName("US-005 — Déclarer un échec de livraison (Tournée Aggregate)")
class DeclarerEchecLivraisonTest {

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

    // ─── Tests scénario nominal ───────────────────────────────────────────────

    @Test
    @DisplayName("SC1 — déclaration échec standard : statut passe à ECHEC et event EchecLivraisonDeclare émis")
    void declarerEchec_statut_passe_a_ECHEC_et_event_emis() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);

        tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        );

        // Statut du colis doit être ECHEC
        Colis colis = tournee.getColis().stream()
                .filter(c -> c.getId().value().equals("colis-001"))
                .findFirst().orElseThrow();
        assertThat(colis.getStatut()).isEqualTo(StatutColis.ECHEC);

        // Un event EchecLivraisonDeclare doit être en attente
        assertThat(tournee.getDomainEvents())
                .hasSize(1)
                .first()
                .isInstanceOf(EchecLivraisonDeclare.class);

        EchecLivraisonDeclare event = (EchecLivraisonDeclare) tournee.getDomainEvents().get(0);
        assertThat(event.tourneeId()).isEqualTo(TOURNEE_ID);
        assertThat(event.colisId()).isEqualTo(new ColisId("colis-001"));
        assertThat(event.motif()).isEqualTo(MotifNonLivraison.ABSENT);
        assertThat(event.disposition()).isEqualTo(Disposition.A_REPRESENTER);
        assertThat(event.noteLibre()).isNull();
        assertThat(event.horodatage()).isNotNull();
    }

    @Test
    @DisplayName("SC3 — note optionnelle incluse dans l'event")
    void declarerEchec_avec_note_incluse_dans_event() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);

        tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.ACCES_IMPOSSIBLE,
                Disposition.RETOUR_DEPOT,
                "Portail code non fonctionnel"
        );

        EchecLivraisonDeclare event = (EchecLivraisonDeclare) tournee.getDomainEvents().get(0);
        assertThat(event.motif()).isEqualTo(MotifNonLivraison.ACCES_IMPOSSIBLE);
        assertThat(event.disposition()).isEqualTo(Disposition.RETOUR_DEPOT);
        assertThat(event.noteLibre()).isEqualTo("Portail code non fonctionnel");
    }

    @Test
    @DisplayName("Le motif est stocké sur le colis après déclaration d'échec")
    void declarerEchec_motif_stocke_sur_colis() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);

        tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.REFUS_CLIENT,
                Disposition.DEPOT_CHEZ_TIERS,
                null
        );

        Colis colis = tournee.getColis().stream()
                .filter(c -> c.getId().value().equals("colis-001"))
                .findFirst().orElseThrow();

        assertThat(colis.getMotifNonLivraison()).isEqualTo(MotifNonLivraison.REFUS_CLIENT);
        assertThat(colis.getDisposition()).isEqualTo(Disposition.DEPOT_CHEZ_TIERS);
    }

    // ─── Invariants ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("INV — motif null lève TourneeInvariantException")
    void declarerEchec_motif_null_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);

        assertThatThrownBy(() -> tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                null,
                Disposition.A_REPRESENTER,
                null
        )).isInstanceOf(TourneeInvariantException.class)
                .hasMessageContaining("motif");
    }

    @Test
    @DisplayName("INV — disposition null lève TourneeInvariantException")
    void declarerEchec_disposition_null_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);

        assertThatThrownBy(() -> tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                null,
                null
        )).isInstanceOf(TourneeInvariantException.class)
                .hasMessageContaining("disposition");
    }

    @Test
    @DisplayName("INV — colis déjà en ECHEC lève TourneeInvariantException")
    void declarerEchec_colis_deja_en_echec_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.ECHEC);

        assertThatThrownBy(() -> tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        )).isInstanceOf(TourneeInvariantException.class)
                .hasMessageContaining("ECHEC");
    }

    @Test
    @DisplayName("INV — colis déjà LIVRE ne peut pas passer en ECHEC")
    void declarerEchec_colis_livre_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.LIVRE);

        assertThatThrownBy(() -> tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        )).isInstanceOf(TourneeInvariantException.class);
    }

    @Test
    @DisplayName("INV — colis introuvable dans la tournée lève ColisNotFoundException via TourneeInvariantException")
    void declarerEchec_colis_inconnu_leve_exception() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);

        assertThatThrownBy(() -> tournee.declarerEchecLivraison(
                new ColisId("colis-INCONNU"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        )).isInstanceOf(TourneeInvariantException.class);
    }

    @Test
    @DisplayName("INV — note libre > 250 caractères lève IllegalArgumentException")
    void echecLivraisonDeclare_note_trop_longue_leve_exception() {
        String noteTropLongue = "x".repeat(251);

        assertThatThrownBy(() -> EchecLivraisonDeclare.of(
                TOURNEE_ID,
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                noteTropLongue
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("250");
    }

    @Test
    @DisplayName("pullDomainEvents vide la liste après consommation")
    void pullDomainEvents_vide_la_liste() {
        Tournee tournee = uneTourneeAvecUnColis("colis-001", StatutColis.A_LIVRER);
        tournee.declarerEchecLivraison(
                new ColisId("colis-001"),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER,
                null
        );

        assertThat(tournee.pullDomainEvents()).hasSize(1);
        assertThat(tournee.getDomainEvents()).isEmpty();
    }
}
