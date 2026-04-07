package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.EtatJournalierLivreur;
import com.docapost.supervision.domain.planification.model.StatutAffectation;
import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.model.VueLivreur;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.domain.planification.service.LivreurReferentiel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests TDD — ConsulterEtatLivreursHandler (US-066)
 *
 * Vérifie la dérivation de EtatJournalierLivreur depuis TourneePlanifieeRepository.
 */
@ExtendWith(MockitoExtension.class)
class ConsulterEtatLivreursHandlerTest {

    @Mock
    private LivreurReferentiel livreurReferentiel;

    @Mock
    private TourneePlanifieeRepository tourneePlanifieeRepository;

    private ConsulterEtatLivreursHandler handler;

    private static final LocalDate DATE_TEST = LocalDate.of(2026, 4, 6);
    private static final Instant IMPORT = Instant.parse("2026-04-06T06:00:00Z");

    @BeforeEach
    void setUp() {
        handler = new ConsulterEtatLivreursHandler(livreurReferentiel, tourneePlanifieeRepository);
    }

    // ─── SC1 : Livreur sans tournée → SANS_TOURNEE ────────────────────────────

    @Test
    @DisplayName("SC1 - livreur sans tournée du jour → état SANS_TOURNEE")
    void livreur_sans_tournee_retourne_SANS_TOURNEE() {
        when(livreurReferentiel.listerLivreurs()).thenReturn(List.of(
                new LivreurReferentiel.LivreurInfo("livreur-jean-moreau", "Jean Moreau")
        ));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-jean-moreau", DATE_TEST))
                .thenReturn(Optional.empty());

        List<VueLivreur> result = handler.handle(DATE_TEST);

        assertThat(result).hasSize(1);
        VueLivreur vue = result.get(0);
        assertThat(vue.livreurId()).isEqualTo("livreur-jean-moreau");
        assertThat(vue.nomComplet()).isEqualTo("Jean Moreau");
        assertThat(vue.etat()).isEqualTo(EtatJournalierLivreur.SANS_TOURNEE);
        assertThat(vue.tourneePlanifieeId()).isNull();
        assertThat(vue.codeTms()).isNull();
    }

    // ─── SC2 : Livreur avec tournée AFFECTEE → AFFECTE_NON_LANCE ─────────────

    @Test
    @DisplayName("SC2 - livreur avec TourneePlanifiee AFFECTEE → état AFFECTE_NON_LANCE")
    void livreur_avec_tournee_AFFECTEE_retourne_AFFECTE_NON_LANCE() {
        when(livreurReferentiel.listerLivreurs()).thenReturn(List.of(
                new LivreurReferentiel.LivreurInfo("livreur-pierre-martin", "Pierre Martin")
        ));
        TourneePlanifiee tp = tourneePlanifieeAffectee("tp-201", "T-201",
                "livreur-pierre-martin", "Pierre Martin");
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-pierre-martin", DATE_TEST))
                .thenReturn(Optional.of(tp));

        List<VueLivreur> result = handler.handle(DATE_TEST);

        assertThat(result).hasSize(1);
        VueLivreur vue = result.get(0);
        assertThat(vue.etat()).isEqualTo(EtatJournalierLivreur.AFFECTE_NON_LANCE);
        assertThat(vue.tourneePlanifieeId()).isEqualTo("tp-201");
        assertThat(vue.codeTms()).isEqualTo("T-201");
    }

    // ─── SC3 : Livreur avec tournée LANCEE → EN_COURS ─────────────────────────

    @Test
    @DisplayName("SC3 - livreur avec TourneePlanifiee LANCEE → état EN_COURS")
    void livreur_avec_tournee_LANCEE_retourne_EN_COURS() {
        when(livreurReferentiel.listerLivreurs()).thenReturn(List.of(
                new LivreurReferentiel.LivreurInfo("livreur-paul-dupont", "Paul Dupont")
        ));
        TourneePlanifiee tp = tourneePlanifieeLancee("tp-204", "T-204",
                "livreur-paul-dupont", "Paul Dupont");
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-paul-dupont", DATE_TEST))
                .thenReturn(Optional.of(tp));

        List<VueLivreur> result = handler.handle(DATE_TEST);

        assertThat(result).hasSize(1);
        VueLivreur vue = result.get(0);
        assertThat(vue.etat()).isEqualTo(EtatJournalierLivreur.EN_COURS);
        assertThat(vue.tourneePlanifieeId()).isEqualTo("tp-204");
        assertThat(vue.codeTms()).isEqualTo("T-204");
    }

    // ─── SC4 : 6 livreurs états mixtes ────────────────────────────────────────

    @Test
    @DisplayName("SC4 - 6 livreurs états mixtes → liste complète avec bons états")
    void six_livreurs_etats_mixtes_retourne_liste_complete() {
        when(livreurReferentiel.listerLivreurs()).thenReturn(List.of(
                new LivreurReferentiel.LivreurInfo("livreur-pierre-martin",  "Pierre Martin"),
                new LivreurReferentiel.LivreurInfo("livreur-paul-dupont",    "Paul Dupont"),
                new LivreurReferentiel.LivreurInfo("livreur-marie-lambert",  "Marie Lambert"),
                new LivreurReferentiel.LivreurInfo("livreur-jean-moreau",    "Jean Moreau"),
                new LivreurReferentiel.LivreurInfo("livreur-sophie-bernard", "Sophie Bernard"),
                new LivreurReferentiel.LivreurInfo("livreur-lucas-petit",    "Lucas Petit")
        ));

        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-pierre-martin",  DATE_TEST))
                .thenReturn(Optional.of(tourneePlanifieeAffectee("tp-201", "T-201", "livreur-pierre-martin", "Pierre Martin")));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-paul-dupont",    DATE_TEST))
                .thenReturn(Optional.of(tourneePlanifieeLancee("tp-204", "T-204", "livreur-paul-dupont", "Paul Dupont")));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-marie-lambert",  DATE_TEST))
                .thenReturn(Optional.of(tourneePlanifieeAffectee("tp-202", "T-202", "livreur-marie-lambert", "Marie Lambert")));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-jean-moreau",    DATE_TEST))
                .thenReturn(Optional.empty());
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-sophie-bernard", DATE_TEST))
                .thenReturn(Optional.of(tourneePlanifieeAffectee("tp-205", "T-205", "livreur-sophie-bernard", "Sophie Bernard")));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-lucas-petit",    DATE_TEST))
                .thenReturn(Optional.of(tourneePlanifieeAffectee("tp-206", "T-206", "livreur-lucas-petit", "Lucas Petit")));

        List<VueLivreur> result = handler.handle(DATE_TEST);

        assertThat(result).hasSize(6);

        assertThat(result).extracting(VueLivreur::etat).containsExactlyInAnyOrder(
                EtatJournalierLivreur.AFFECTE_NON_LANCE,
                EtatJournalierLivreur.EN_COURS,
                EtatJournalierLivreur.AFFECTE_NON_LANCE,
                EtatJournalierLivreur.SANS_TOURNEE,
                EtatJournalierLivreur.AFFECTE_NON_LANCE,
                EtatJournalierLivreur.AFFECTE_NON_LANCE
        );

        // Vérification spécifique Jean Moreau
        VueLivreur jean = result.stream()
                .filter(v -> v.livreurId().equals("livreur-jean-moreau"))
                .findFirst().orElseThrow();
        assertThat(jean.etat()).isEqualTo(EtatJournalierLivreur.SANS_TOURNEE);
        assertThat(jean.tourneePlanifieeId()).isNull();

        // Vérification spécifique Paul Dupont
        VueLivreur paul = result.stream()
                .filter(v -> v.livreurId().equals("livreur-paul-dupont"))
                .findFirst().orElseThrow();
        assertThat(paul.etat()).isEqualTo(EtatJournalierLivreur.EN_COURS);
        assertThat(paul.codeTms()).isEqualTo("T-204");
    }

    // ─── SC5 : NON_AFFECTEE est ignoré ────────────────────────────────────────

    @Test
    @DisplayName("SC5 - TourneePlanifiee NON_AFFECTEE ne count pas pour le livreur (repository retourne empty)")
    void tournee_NON_AFFECTEE_retourne_SANS_TOURNEE() {
        // La règle : le repository ne retourne que AFFECTEE|LANCEE via findByLivreurIdAndDate
        // Si empty → SANS_TOURNEE (NON_AFFECTEE n'est jamais retourné par la requête JPQL)
        when(livreurReferentiel.listerLivreurs()).thenReturn(List.of(
                new LivreurReferentiel.LivreurInfo("livreur-jean-moreau", "Jean Moreau")
        ));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-jean-moreau", DATE_TEST))
                .thenReturn(Optional.empty()); // Repository filtre statut IN (AFFECTEE, LANCEE)

        List<VueLivreur> result = handler.handle(DATE_TEST);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).etat()).isEqualTo(EtatJournalierLivreur.SANS_TOURNEE);
    }

    // ─── SC6 : Date différente ────────────────────────────────────────────────

    @Test
    @DisplayName("SC6 - date différente d'aujourd'hui → filtre correctement par date")
    void date_differente_filtre_correctement() {
        LocalDate hier = DATE_TEST.minusDays(1);
        when(livreurReferentiel.listerLivreurs()).thenReturn(List.of(
                new LivreurReferentiel.LivreurInfo("livreur-pierre-martin", "Pierre Martin")
        ));
        when(tourneePlanifieeRepository.findByLivreurIdAndDate("livreur-pierre-martin", hier))
                .thenReturn(Optional.empty());

        List<VueLivreur> result = handler.handle(hier);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).etat()).isEqualTo(EtatJournalierLivreur.SANS_TOURNEE);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneePlanifieeAffectee(String id, String codeTms,
                                                       String livreurId, String livreurNom) {
        return new TourneePlanifiee(
                id, codeTms, DATE_TEST, 20,
                List.of(), List.of(), List.of(), IMPORT,
                StatutAffectation.AFFECTEE,
                livreurId, livreurNom, "VH-01",
                IMPORT.plusSeconds(300), null, false
        );
    }

    private TourneePlanifiee tourneePlanifieeLancee(String id, String codeTms,
                                                     String livreurId, String livreurNom) {
        return new TourneePlanifiee(
                id, codeTms, DATE_TEST, 22,
                List.of(), List.of(), List.of(), IMPORT,
                StatutAffectation.LANCEE,
                livreurId, livreurNom, "VH-02",
                IMPORT.plusSeconds(300), IMPORT.plusSeconds(900), false
        );
    }
}
