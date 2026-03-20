package com.docapost.tournee.domain;

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
