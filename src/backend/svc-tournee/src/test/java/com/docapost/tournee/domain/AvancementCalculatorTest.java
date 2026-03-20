package com.docapost.tournee.domain;

import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.service.AvancementCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests unitaires TDD — Domain Service AvancementCalculator (US-002)
 *
 * Verifie que le Domain Service calcule correctement :
 * - resteALivrer : seuls les colis A_LIVRER sont comptes
 * - estimationFin : calcule selon la cadence moyenne depuis le debut de la tournee
 * - cas particulier : tous les colis traites (resteALivrer == 0)
 *
 * Scenarios US-002 :
 * - Sc1 : 22 colis dont 8 traites → reste 14
 * - Sc2 : apres livraison : reste 13
 * - Sc3 : apres echec : reste 12
 * - Sc4 : dernier colis traite → reste 0, tournee terminee
 */
class AvancementCalculatorTest {

    private TourneeId tourneeId;
    private LivreurId livreurId;
    private LocalDate today;
    private AvancementCalculator calculator;

    @BeforeEach
    void setUp() {
        tourneeId = new TourneeId("tournee-001");
        livreurId = new LivreurId("livreur-001");
        today = LocalDate.now();
        calculator = new AvancementCalculator();
    }

    // ─── Scenario 1 : Affichage initial ──────────────────────────────────────

    @Test
    @DisplayName("SC1 - Avec 22 colis dont 8 traites, resteALivrer vaut 14")
    void sc1_reste_a_livrer_avec_22_colis_dont_8_traites() {
        List<Colis> colis = new ArrayList<>();
        // 14 colis a livrer
        for (int i = 0; i < 14; i++) {
            colis.add(unColis("a-" + i, StatutColis.A_LIVRER));
        }
        // 5 colis livres
        for (int i = 0; i < 5; i++) {
            colis.add(unColis("l-" + i, StatutColis.LIVRE));
        }
        // 3 colis en echec
        for (int i = 0; i < 3; i++) {
            colis.add(unColis("e-" + i, StatutColis.ECHEC));
        }

        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);
        Avancement avancement = calculator.calculer(tournee);

        assertThat(avancement.resteALivrer()).isEqualTo(14);
        assertThat(avancement.colisTotal()).isEqualTo(22);
        assertThat(avancement.colisTraites()).isEqualTo(8);
    }

    // ─── Scenario 2 : Apres une livraison ────────────────────────────────────

    @Test
    @DisplayName("SC2 - Apres une livraison supplementaire, resteALivrer diminue de 1")
    void sc2_reste_a_livrer_apres_une_livraison() {
        List<Colis> colis = new ArrayList<>();
        // 13 colis a livrer
        for (int i = 0; i < 13; i++) {
            colis.add(unColis("a-" + i, StatutColis.A_LIVRER));
        }
        // 9 colis livres ou echec
        for (int i = 0; i < 9; i++) {
            colis.add(unColis("l-" + i, StatutColis.LIVRE));
        }

        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);
        Avancement avancement = calculator.calculer(tournee);

        assertThat(avancement.resteALivrer()).isEqualTo(13);
        assertThat(avancement.colisTotal()).isEqualTo(22);
    }

    // ─── Scenario 3 : A_REPRESENTER exclu du reste a livrer ─────────────────

    @Test
    @DisplayName("SC3 - Les colis A_REPRESENTER ne comptent PAS dans le reste a livrer")
    void sc3_a_representer_exclu_du_reste_a_livrer() {
        List<Colis> colis = List.of(
                unColis("a-1", StatutColis.A_LIVRER),
                unColis("a-2", StatutColis.A_LIVRER),
                unColis("l-1", StatutColis.LIVRE),
                unColis("e-1", StatutColis.ECHEC),
                unColis("r-1", StatutColis.A_REPRESENTER)  // exclu du reste a livrer
        );

        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);
        Avancement avancement = calculator.calculer(tournee);

        // resteALivrer = uniquement les A_LIVRER
        assertThat(avancement.resteALivrer()).isEqualTo(2);
        assertThat(avancement.colisTotal()).isEqualTo(5);
        // colisTraites = LIVRE + ECHEC + A_REPRESENTER = 3
        assertThat(avancement.colisTraites()).isEqualTo(3);
    }

    // ─── Scenario 4 : Tous les colis traites ─────────────────────────────────

    @Test
    @DisplayName("SC4 - Quand tous les colis sont traites, resteALivrer vaut 0 et estTerminee est true")
    void sc4_tous_colis_traites_tournee_terminee() {
        List<Colis> colis = List.of(
                unColis("l-1", StatutColis.LIVRE),
                unColis("l-2", StatutColis.LIVRE),
                unColis("e-1", StatutColis.ECHEC)
        );

        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);
        Avancement avancement = calculator.calculer(tournee);

        assertThat(avancement.resteALivrer()).isEqualTo(0);
        assertThat(avancement.estTerminee()).isTrue();
    }

    // ─── Estimation de fin ───────────────────────────────────────────────────

    @Test
    @DisplayName("estimationFin est null si aucun colis n'est encore traite (cadence inconnue)")
    void estimation_fin_null_si_aucun_traite() {
        List<Colis> colis = List.of(
                unColis("a-1", StatutColis.A_LIVRER),
                unColis("a-2", StatutColis.A_LIVRER)
        );

        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);
        Avancement avancement = calculator.calculer(tournee);

        // Pas encore de donnee de cadence disponible dans le MVP
        assertThat(avancement.estimationFin()).isNull();
    }

    @Test
    @DisplayName("calculer() est coherent avec Tournee.calculerAvancement() — meme resultat")
    void calculer_coherent_avec_tournee_calculer_avancement() {
        List<Colis> colis = List.of(
                unColis("a-1", StatutColis.A_LIVRER),
                unColis("l-1", StatutColis.LIVRE),
                unColis("e-1", StatutColis.ECHEC)
        );

        Tournee tournee = new Tournee(tourneeId, livreurId, today, colis, StatutTournee.DEMARREE);

        Avancement viaCalculator = calculator.calculer(tournee);
        Avancement viaTournee = tournee.calculerAvancement();

        assertThat(viaCalculator.resteALivrer()).isEqualTo(viaTournee.resteALivrer());
        assertThat(viaCalculator.colisTotal()).isEqualTo(viaTournee.colisTotal());
        assertThat(viaCalculator.colisTraites()).isEqualTo(viaTournee.colisTraites());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Colis unColis(String id, StatutColis statut) {
        return new Colis(
                new ColisId(id),
                tourneeId,
                statut,
                new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of()
        );
    }
}
