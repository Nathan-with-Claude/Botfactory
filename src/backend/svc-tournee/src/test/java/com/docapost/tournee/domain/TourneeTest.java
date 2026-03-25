package com.docapost.tournee.domain;

import com.docapost.tournee.domain.events.TourneeCloturee;
import com.docapost.tournee.domain.events.TourneeDemarree;
import com.docapost.tournee.domain.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests unitaires TDD — Aggregate Root Tournee
 * Ecrits avant l'implémentation (Red-Green-Refactor)
 */
class TourneeTest {

    private TourneeId tourneeId;
    private LivreurId livreurId;
    private LocalDate today;

    @BeforeEach
    void setUp() {
        tourneeId = new TourneeId("tournee-001");
        livreurId = new LivreurId("livreur-001");
        today = LocalDate.now();
    }

    // ─── Invariant : au moins un colis ───────────────────────────────────────

    @Test
    @DisplayName("demarrer() leve une exception si la tournee ne contient aucun colis")
    void demarrer_sans_colis_leve_exception() {
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(), StatutTournee.CHARGEE);

        assertThatThrownBy(tournee::demarrer)
                .isInstanceOf(TourneeInvariantException.class)
                .hasMessageContaining("au moins un colis");
    }

    @Test
    @DisplayName("demarrer() reussit si la tournee contient au moins un colis")
    void demarrer_avec_colis_reussit() {
        Colis colis = unColisSurUneLivraison();
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(colis), StatutTournee.CHARGEE);

        assertThatCode(tournee::demarrer).doesNotThrowAnyException();
        assertThat(tournee.getStatut()).isEqualTo(StatutTournee.DEMARREE);
    }

    // ─── Idempotence de demarrer() ───────────────────────────────────────────

    @Test
    @DisplayName("demarrer() est idempotent : n'emet pas TourneeDemarree si deja demarree")
    void demarrer_est_idempotent() {
        Colis colis = unColisSurUneLivraison();
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(colis), StatutTournee.CHARGEE);

        tournee.demarrer(); // premier appel : produit l'evenement
        int eventsApremierAppel = tournee.getDomainEvents().size();

        tournee.demarrer(); // deuxieme appel : idempotent, ne reproduit pas l'evenement
        int eventsApresDeuxiemeAppel = tournee.getDomainEvents().size();

        assertThat(eventsApresDeuxiemeAppel).isEqualTo(eventsApremierAppel);
        assertThat(tournee.getStatut()).isEqualTo(StatutTournee.DEMARREE);
    }

    @Test
    @DisplayName("demarrer() emet exactement un evenement TourneeDemarree au premier appel")
    void demarrer_emet_tourneeDemarree_au_premier_appel() {
        Colis colis = unColisSurUneLivraison();
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(colis), StatutTournee.CHARGEE);

        tournee.demarrer();

        assertThat(tournee.getDomainEvents()).hasSize(1);
        assertThat(tournee.getDomainEvents().get(0)).isInstanceOf(TourneeDemarree.class);

        TourneeDemarree event = (TourneeDemarree) tournee.getDomainEvents().get(0);
        assertThat(event.tourneeId()).isEqualTo(tourneeId);
        assertThat(event.livreurId()).isEqualTo(livreurId);
        assertThat(event.horodatage()).isNotNull();
    }

    // ─── calculerAvancement() ────────────────────────────────────────────────

    @Test
    @DisplayName("calculerAvancement() retourne 0 traites sur 5 total si tous sont a livrer")
    void calculerAvancement_tous_a_livrer() {
        List<Colis> colis = List.of(
                unColisSurUneLivraison(),
                unColisSurUneLivraison(),
                unColisSurUneLivraison(),
                unColisSurUneLivraison(),
                unColisSurUneLivraison()
        );
        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);

        Avancement avancement = tournee.calculerAvancement();

        assertThat(avancement.colisTraites()).isEqualTo(0);
        assertThat(avancement.colisTotal()).isEqualTo(5);
    }

    @Test
    @DisplayName("calculerAvancement() compte les colis livres et echecs comme traites")
    void calculerAvancement_compte_livres_et_echecs() {
        Colis livre = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE,
                uneAdresse(), unDestinataire(), List.of()
        );
        Colis echec = new Colis(
                new ColisId("c-2"), tourneeId,
                StatutColis.ECHEC,
                uneAdresse(), unDestinataire(), List.of()
        );
        Colis aLivrer = unColisSurUneLivraison();

        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(livre, echec, aLivrer), StatutTournee.DEMARREE);

        Avancement avancement = tournee.calculerAvancement();

        assertThat(avancement.colisTraites()).isEqualTo(2);
        assertThat(avancement.colisTotal()).isEqualTo(3);
    }

    @Test
    @DisplayName("calculerAvancement() compte les colis a representer comme traites")
    void calculerAvancement_compte_a_representer() {
        Colis aRepresenter = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.A_REPRESENTER,
                uneAdresse(), unDestinataire(), List.of()
        );
        Colis aLivrer = unColisSurUneLivraison();

        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(aRepresenter, aLivrer), StatutTournee.DEMARREE);

        Avancement avancement = tournee.calculerAvancement();

        assertThat(avancement.colisTraites()).isEqualTo(1);
        assertThat(avancement.colisTotal()).isEqualTo(2);
    }

    // ─── cloturerTournee() ───────────────────────────────────────────────────

    @Test
    @DisplayName("cloturerTournee() passe le statut a CLOTUREE si tous les colis sont traites")
    void cloturerTournee_reussit_si_tous_traites() {
        Colis livre = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Colis echec = new Colis(
                new ColisId("c-2"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of()
        );
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(livre, echec), StatutTournee.DEMARREE);

        assertThatCode(tournee::cloturerTournee).doesNotThrowAnyException();
        assertThat(tournee.getStatut()).isEqualTo(StatutTournee.CLOTUREE);
    }

    @Test
    @DisplayName("cloturerTournee() emet TourneeCloturee avec le recap de la tournee")
    void cloturerTournee_emet_event_avec_recap() {
        Colis livre1 = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Colis livre2 = new Colis(
                new ColisId("c-2"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        // ECHEC avec disposition RETOUR_DEPOT (echec definif, pas a representer)
        Colis echec = new Colis(
                new ColisId("c-3"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.ABSENT, Disposition.RETOUR_DEPOT
        );
        // ECHEC avec disposition A_REPRESENTER (nouvelle tentative souhaitee)
        Colis aRepresenter = new Colis(
                new ColisId("c-4"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.ABSENT, Disposition.A_REPRESENTER
        );
        Tournee tournee = new Tournee(
                tourneeId, livreurId, today,
                List.of(livre1, livre2, echec, aRepresenter),
                StatutTournee.DEMARREE
        );

        tournee.cloturerTournee();

        assertThat(tournee.getDomainEvents()).hasSize(1);
        assertThat(tournee.getDomainEvents().get(0)).isInstanceOf(TourneeCloturee.class);

        TourneeCloturee event = (TourneeCloturee) tournee.getDomainEvents().get(0);
        assertThat(event.tourneeId()).isEqualTo(tourneeId);
        assertThat(event.livreurId()).isEqualTo(livreurId);
        assertThat(event.recap().colisTotal()).isEqualTo(4);
        assertThat(event.recap().colisLivres()).isEqualTo(2);
        assertThat(event.recap().colisEchecs()).isEqualTo(1);
        assertThat(event.recap().colisARepresenter()).isEqualTo(1);
        assertThat(event.horodatage()).isNotNull();
    }

    // ─── BUG-C : RecapitulatifTournee.calculer() — A_REPRESENTER vs ECHEC ─────

    @Test
    @DisplayName("BUG-C : RecapitulatifTournee — colisARepresenter compte les ECHEC+A_REPRESENTER, pas les autres ECHEC")
    void recapitulatif_distingue_echec_et_a_representer() {
        // 3 colis livres
        Colis livre1 = new Colis(new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of());
        Colis livre2 = new Colis(new ColisId("c-2"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of());
        Colis livre3 = new Colis(new ColisId("c-3"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of());
        // 2 colis echec definif (RETOUR_DEPOT)
        Colis echecRetour1 = new Colis(new ColisId("c-4"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.ABSENT, Disposition.RETOUR_DEPOT);
        Colis echecRetour2 = new Colis(new ColisId("c-5"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.REFUS_CLIENT, Disposition.DEPOT_CHEZ_TIERS);
        // 1 colis a representer (ECHEC + A_REPRESENTER)
        Colis aRepresenter = new Colis(new ColisId("c-6"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.HORAIRE_DEPASSE, Disposition.A_REPRESENTER);

        RecapitulatifTournee recap = RecapitulatifTournee.calculer(
                List.of(livre1, livre2, livre3, echecRetour1, echecRetour2, aRepresenter)
        );

        assertThat(recap.colisTotal()).isEqualTo(6);
        assertThat(recap.colisLivres()).isEqualTo(3);
        assertThat(recap.colisEchecs()).isEqualTo(2);      // RETOUR_DEPOT + DEPOT_CHEZ_TIERS
        assertThat(recap.colisARepresenter()).isEqualTo(1); // A_REPRESENTER seulement
        // Verification de la somme totale
        assertThat(recap.colisLivres() + recap.colisEchecs() + recap.colisARepresenter())
                .isEqualTo(recap.colisTotal());
    }

    @Test
    @DisplayName("BUG-C : RecapitulatifTournee — colisEchecs = 0 si tous les ECHEC sont A_REPRESENTER")
    void recapitulatif_echecs_zero_si_tous_a_representer() {
        Colis livre = new Colis(new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of());
        Colis aRepresenter1 = new Colis(new ColisId("c-2"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.ABSENT, Disposition.A_REPRESENTER);
        Colis aRepresenter2 = new Colis(new ColisId("c-3"), tourneeId,
                StatutColis.ECHEC, uneAdresse(), unDestinataire(), List.of(),
                MotifNonLivraison.ACCES_IMPOSSIBLE, Disposition.A_REPRESENTER);

        RecapitulatifTournee recap = RecapitulatifTournee.calculer(
                List.of(livre, aRepresenter1, aRepresenter2)
        );

        assertThat(recap.colisTotal()).isEqualTo(3);
        assertThat(recap.colisLivres()).isEqualTo(1);
        assertThat(recap.colisEchecs()).isEqualTo(0);
        assertThat(recap.colisARepresenter()).isEqualTo(2);
        assertThat(recap.colisLivres() + recap.colisEchecs() + recap.colisARepresenter())
                .isEqualTo(recap.colisTotal());
    }

    @Test
    @DisplayName("cloturerTournee() leve une exception si au moins un colis est encore a livrer")
    void cloturerTournee_leve_exception_si_colis_a_livrer() {
        Colis livre = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Colis aLivrer = unColisSurUneLivraison();
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(livre, aLivrer), StatutTournee.DEMARREE);

        assertThatThrownBy(tournee::cloturerTournee)
                .isInstanceOf(TourneeInvariantException.class)
                .hasMessageContaining("a livrer");
    }

    @Test
    @DisplayName("cloturerTournee() est idempotent : n'emet pas TourneeCloturee si deja cloturee")
    void cloturerTournee_est_idempotent() {
        Colis livre = new Colis(
                new ColisId("c-1"), tourneeId,
                StatutColis.LIVRE, uneAdresse(), unDestinataire(), List.of()
        );
        Tournee tournee = new Tournee(tourneeId, livreurId, today, List.of(livre), StatutTournee.CLOTUREE);

        // Appel sur une tournee deja cloturee : ne doit pas lever d'exception ni re-emettre l'event
        assertThatCode(tournee::cloturerTournee).doesNotThrowAnyException();
        assertThat(tournee.getDomainEvents()).isEmpty();
        assertThat(tournee.getStatut()).isEqualTo(StatutTournee.CLOTUREE);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Colis unColisSurUneLivraison() {
        return new Colis(
                new ColisId("c-" + System.nanoTime()),
                tourneeId,
                StatutColis.A_LIVRER,
                uneAdresse(),
                unDestinataire(),
                List.of()
        );
    }

    private Adresse uneAdresse() {
        return new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A");
    }

    private Destinataire unDestinataire() {
        return new Destinataire("M. Dupont", "0601020304");
    }
}
