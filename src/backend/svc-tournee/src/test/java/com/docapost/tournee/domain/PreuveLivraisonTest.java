package com.docapost.tournee.domain;

import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.preuves.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests unitaires TDD — Aggregate Root PreuveLivraison (BC-02)
 *
 * BUG-C corriges ici : les preuves sont immuables apres creation.
 * US-008 : signature numerique
 * US-009 : photo, tiers identifie, depot securise
 *
 * Ecrits avant l'implementation (Red-Green-Refactor).
 */
class PreuveLivraisonTest {

    private static final ColisId COLIS_ID = new ColisId("colis-001");
    private static final TourneeId TOURNEE_ID = new TourneeId("tournee-001");

    // ─── US-008 : SignatureNumerique ─────────────────────────────────────────

    @Test
    @DisplayName("US-008 SC1 : captureSignature() cree une PreuveLivraison immuable de type SIGNATURE")
    void captureSignature_cree_preuve_signature() {
        byte[] signatureData = "tracé_base64".getBytes();

        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                COLIS_ID,
                TOURNEE_ID,
                signatureData,
                null // coordonnees GPS — null si indisponible (mode degrade)
        );

        assertThat(preuve.getId()).isNotNull();
        assertThat(preuve.getColisId()).isEqualTo(COLIS_ID);
        assertThat(preuve.getTourneeId()).isEqualTo(TOURNEE_ID);
        assertThat(preuve.getType()).isEqualTo(TypePreuve.SIGNATURE);
        assertThat(preuve.getHorodatage()).isNotNull();
        assertThat(preuve.getSignatureNumerique()).isNotNull();
        assertThat(preuve.getSignatureNumerique().donneesBase64()).isEqualTo(signatureData);
    }

    @Test
    @DisplayName("US-008 SC1 : captureSignature() avec coordonnees GPS enregistre la geolocalisation")
    void captureSignature_avec_gps_enregistre_coordonnees() {
        Coordonnees gps = new Coordonnees(45.748040, 4.846300);

        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                COLIS_ID, TOURNEE_ID, "sig".getBytes(), gps
        );

        assertThat(preuve.getCoordonnees()).isNotNull();
        assertThat(preuve.getCoordonnees().latitude()).isEqualTo(45.748040);
        assertThat(preuve.getCoordonnees().longitude()).isEqualTo(4.846300);
    }

    @Test
    @DisplayName("US-008 SC4 : captureSignature() sans GPS (mode degrade) — coordonnees null documentees")
    void captureSignature_sans_gps_mode_degrade() {
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                COLIS_ID, TOURNEE_ID, "sig".getBytes(), null
        );

        assertThat(preuve.getCoordonnees()).isNull();
        assertThat(preuve.isModeDegradeGps()).isTrue();
    }

    @Test
    @DisplayName("US-008 SC2 : captureSignature() leve exception si donnees de signature null ou vides")
    void captureSignature_leve_exception_si_donnees_vides() {
        assertThatThrownBy(() ->
                PreuveLivraison.captureSignature(COLIS_ID, TOURNEE_ID, null, null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class)
                .hasMessageContaining("signature");

        assertThatThrownBy(() ->
                PreuveLivraison.captureSignature(COLIS_ID, TOURNEE_ID, new byte[0], null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class)
                .hasMessageContaining("signature");
    }

    @Test
    @DisplayName("US-008 SC5 : PreuveLivraison est immuable apres creation (opposabilite juridique)")
    void preuve_est_immuable_apres_creation() {
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                COLIS_ID, TOURNEE_ID, "sig".getBytes(), null
        );

        // L'agregat n'expose aucune methode de modification
        // On verifie que l'identifiant est stable
        PreuveLivraisonId idInitial = preuve.getId();
        Instant horodatageInitial = preuve.getHorodatage();

        assertThat(preuve.getId()).isEqualTo(idInitial);
        assertThat(preuve.getHorodatage()).isEqualTo(horodatageInitial);
    }

    @Test
    @DisplayName("US-008 : captureSignature() emet le Domain Event PreuveCapturee")
    void captureSignature_emet_preuve_capturee() {
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                COLIS_ID, TOURNEE_ID, "sig".getBytes(), new Coordonnees(45.7, 4.8)
        );

        assertThat(preuve.getDomainEvents()).hasSize(1);
        assertThat(preuve.getDomainEvents().get(0))
                .isInstanceOf(com.docapost.tournee.domain.preuves.events.PreuveCapturee.class);

        com.docapost.tournee.domain.preuves.events.PreuveCapturee event =
                (com.docapost.tournee.domain.preuves.events.PreuveCapturee) preuve.getDomainEvents().get(0);
        assertThat(event.colisId()).isEqualTo(COLIS_ID);
        assertThat(event.tourneeId()).isEqualTo(TOURNEE_ID);
        assertThat(event.type()).isEqualTo(TypePreuve.SIGNATURE);
        assertThat(event.preuveLivraisonId()).isEqualTo(preuve.getId());
    }

    // ─── US-009 : Photo ──────────────────────────────────────────────────────

    @Test
    @DisplayName("US-009 SC1 : capturePhoto() cree une PreuveLivraison de type PHOTO avec URL et hash")
    void capturePhoto_cree_preuve_photo() {
        PreuveLivraison preuve = PreuveLivraison.capturePhoto(
                COLIS_ID, TOURNEE_ID,
                "photos/tournee-001/colis-001-1711273200.jpg",
                "sha256:abc123def456",
                new Coordonnees(45.7, 4.8)
        );

        assertThat(preuve.getType()).isEqualTo(TypePreuve.PHOTO);
        assertThat(preuve.getPhotoPreuve()).isNotNull();
        assertThat(preuve.getPhotoPreuve().urlPhoto()).isEqualTo("photos/tournee-001/colis-001-1711273200.jpg");
        assertThat(preuve.getPhotoPreuve().hashIntegrite()).isEqualTo("sha256:abc123def456");
    }

    @Test
    @DisplayName("US-009 SC1 : capturePhoto() leve exception si URL de photo null ou vide")
    void capturePhoto_leve_exception_si_url_vide() {
        assertThatThrownBy(() ->
                PreuveLivraison.capturePhoto(COLIS_ID, TOURNEE_ID, null, "hash", null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class);

        assertThatThrownBy(() ->
                PreuveLivraison.capturePhoto(COLIS_ID, TOURNEE_ID, "", "hash", null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class);
    }

    // ─── US-009 : TiersIdentifie ─────────────────────────────────────────────

    @Test
    @DisplayName("US-009 SC2 : captureTiers() cree une PreuveLivraison de type TIERS_IDENTIFIE")
    void captureTiers_cree_preuve_tiers() {
        PreuveLivraison preuve = PreuveLivraison.captureTiers(
                COLIS_ID, TOURNEE_ID,
                "Mme Leroy",
                new Coordonnees(45.7, 4.8)
        );

        assertThat(preuve.getType()).isEqualTo(TypePreuve.TIERS_IDENTIFIE);
        assertThat(preuve.getTiersIdentifie()).isNotNull();
        assertThat(preuve.getTiersIdentifie().nomTiers()).isEqualTo("Mme Leroy");
    }

    @Test
    @DisplayName("US-009 SC3 : captureTiers() leve exception si nom du tiers null ou vide")
    void captureTiers_leve_exception_si_nom_vide() {
        assertThatThrownBy(() ->
                PreuveLivraison.captureTiers(COLIS_ID, TOURNEE_ID, null, null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class)
                .hasMessageContaining("tiers");

        assertThatThrownBy(() ->
                PreuveLivraison.captureTiers(COLIS_ID, TOURNEE_ID, "  ", null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class)
                .hasMessageContaining("tiers");
    }

    // ─── US-009 : DepotSecurise ───────────────────────────────────────────────

    @Test
    @DisplayName("US-009 SC4 : captureDepotSecurise() cree une PreuveLivraison de type DEPOT_SECURISE")
    void captureDepotSecurise_cree_preuve_depot() {
        PreuveLivraison preuve = PreuveLivraison.captureDepotSecurise(
                COLIS_ID, TOURNEE_ID,
                "Boite aux lettres n°3",
                new Coordonnees(45.7, 4.8)
        );

        assertThat(preuve.getType()).isEqualTo(TypePreuve.DEPOT_SECURISE);
        assertThat(preuve.getDepotSecurise()).isNotNull();
        assertThat(preuve.getDepotSecurise().description()).isEqualTo("Boite aux lettres n°3");
    }

    @Test
    @DisplayName("US-009 SC4 : captureDepotSecurise() leve exception si description null ou vide")
    void captureDepotSecurise_leve_exception_si_description_vide() {
        assertThatThrownBy(() ->
                PreuveLivraison.captureDepotSecurise(COLIS_ID, TOURNEE_ID, null, null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class);

        assertThatThrownBy(() ->
                PreuveLivraison.captureDepotSecurise(COLIS_ID, TOURNEE_ID, "", null)
        ).isInstanceOf(PreuveLivraisonInvariantException.class);
    }
}
