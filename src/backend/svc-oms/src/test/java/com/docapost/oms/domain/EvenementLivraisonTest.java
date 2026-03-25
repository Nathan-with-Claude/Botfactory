package com.docapost.oms.domain;

import com.docapost.oms.domain.model.*;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests unitaires — EvenementLivraison (US-018 immuabilité).
 */
class EvenementLivraisonTest {

    private static final Coordonnees COORDS = new Coordonnees(48.8566, 2.3522);
    private static final Instant NOW = Instant.now();

    private EvenementLivraison buildEvenement() {
        return new EvenementLivraison(
                "evt-test-001", "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, NOW,
                COORDS, false, "preuve-001", null,
                StatutSynchronisation.PENDING, 0
        );
    }

    // ─── US-018 SC1 : attributs obligatoires ──────────────────────────────────

    @Test
    void devrait_creer_evenement_avec_4_attributs_obligatoires() {
        EvenementLivraison ev = buildEvenement();
        assertThat(ev.livreurId()).isEqualTo("livreur-001");         // qui
        assertThat(ev.type()).isEqualTo(TypeEvenement.LIVRAISON_CONFIRMEE); // quoi
        assertThat(ev.horodatage()).isEqualTo(NOW);                  // quand
        assertThat(ev.coordonnees()).isEqualTo(COORDS);              // géolocalisation
    }

    // ─── US-018 SC2 : immuabilité — attributs non modifiables ────────────────

    @Test
    void devrait_rejeter_eventId_null() {
        assertThatThrownBy(() -> new EvenementLivraison(
                null, "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, NOW,
                COORDS, false, null, null,
                StatutSynchronisation.PENDING, 0
        )).isInstanceOf(NullPointerException.class);
    }

    @Test
    void devrait_rejeter_livreurId_null() {
        assertThatThrownBy(() -> new EvenementLivraison(
                "evt-001", "tournee-001", "colis-001", null,
                TypeEvenement.LIVRAISON_CONFIRMEE, NOW,
                COORDS, false, null, null,
                StatutSynchronisation.PENDING, 0
        )).isInstanceOf(NullPointerException.class);
    }

    @Test
    void devrait_rejeter_coordonnees_null_sans_mode_degrade() {
        assertThatThrownBy(() -> new EvenementLivraison(
                "evt-001", "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, NOW,
                null, false, null, null,
                StatutSynchronisation.PENDING, 0
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("modeDegradGPS");
    }

    // ─── US-018 SC4 : mode dégradé GPS ───────────────────────────────────────

    @Test
    void devrait_accepter_coordonnees_null_en_mode_degrade_gps() {
        EvenementLivraison ev = new EvenementLivraison(
                "evt-001", "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.ECHEC_LIVRAISON_DECLARE, NOW,
                null, true, null, "ABSENT",
                StatutSynchronisation.PENDING, 0
        );
        assertThat(ev.modeDegradGPS()).isTrue();
        assertThat(ev.coordonnees()).isNull();
        assertThat(ev.livreurId()).isEqualTo("livreur-001"); // qui toujours présent
        assertThat(ev.horodatage()).isNotNull();              // quand toujours présent
    }

    // ─── US-017 : marquerSynchronise + immuabilité ───────────────────────────

    @Test
    void marquerSynchronise_retourne_nouvel_objet_sans_modifier_loriginal() {
        EvenementLivraison original = buildEvenement();
        EvenementLivraison synchronise = original.marquerSynchronise();

        // Nouvel objet avec statut mis à jour
        assertThat(synchronise.statutSynchronisation()).isEqualTo(StatutSynchronisation.SYNCHRONIZED);
        assertThat(synchronise.tentativesSynchronisation()).isEqualTo(1);

        // Original inchangé (immuabilité record Java)
        assertThat(original.statutSynchronisation()).isEqualTo(StatutSynchronisation.PENDING);
        assertThat(original.tentativesSynchronisation()).isEqualTo(0);

        // Contenu métier identique
        assertThat(synchronise.eventId()).isEqualTo(original.eventId());
        assertThat(synchronise.livreurId()).isEqualTo(original.livreurId());
    }

    @Test
    void marquerEchecSynchronisation_retourne_statut_FAILED() {
        EvenementLivraison ev = buildEvenement();
        EvenementLivraison echec = ev.marquerEchecSynchronisation();

        assertThat(echec.statutSynchronisation()).isEqualTo(StatutSynchronisation.FAILED);
        assertThat(echec.tentativesSynchronisation()).isEqualTo(1);
        assertThat(ev.statutSynchronisation()).isEqualTo(StatutSynchronisation.PENDING); // original intact
    }

    // ─── Coordonnees validation ───────────────────────────────────────────────

    @Test
    void devrait_rejeter_latitude_invalide() {
        assertThatThrownBy(() -> new Coordonnees(91.0, 2.35))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Latitude invalide");
    }

    @Test
    void devrait_rejeter_longitude_invalide() {
        assertThatThrownBy(() -> new Coordonnees(48.85, 181.0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Longitude invalide");
    }
}
