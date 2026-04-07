package com.docapost.supervision.infrastructure.seeder;

import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.dev.DevEventBridge;
import com.docapost.supervision.infrastructure.persistence.*;
import com.docapost.supervision.infrastructure.planification.TourneePlanifieeJpaRepository;
import com.docapost.supervision.infrastructure.planification.TourneePlanifieeMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DevDataSeeder — Données de test pour le profil dev (US-011).
 *
 * IDs alignés avec svc-tournee DevDataSeeder (BC-01) pour cohérence CQRS :
 * - tournee-dev-001 : Pierre Martin  (livreur-001, 5 colis, EN_COURS)
 * - tournee-dev-003 : Marie Lambert  (livreur-003, 3 colis, EN_COURS)
 * - tournee-dev-004 : Jean Moreau    (livreur-004, 6 colis, A_RISQUE)
 *
 * Idempotent : skip si des VueTournee existent déjà (ex. redémarrage sans reset).
 * Appeler reinitialiser() puis seed() pour forcer un re-seed complet.
 *
 * Source : US-011, US-049
 */
@Component
@Profile({"dev", "recette"})
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final VueTourneeRepository vueTourneeRepository;
    private final VueTourneeJpaRepository vueTourneeJpaRepository;
    private final VueColisJpaRepository vueColisJpaRepository;
    private final IncidentVueJpaRepository incidentVueJpaRepository;
    private final InstructionJpaRepository instructionJpaRepository;
    private final TourneePlanifieeJpaRepository tourneePlanifieeJpaRepository;
    private final ProcessedEventJpaRepository processedEventJpaRepository;
    private final DevEventBridge devEventBridge;

    public DevDataSeeder(
            VueTourneeRepository vueTourneeRepository,
            VueTourneeJpaRepository vueTourneeJpaRepository,
            VueColisJpaRepository vueColisJpaRepository,
            IncidentVueJpaRepository incidentVueJpaRepository,
            InstructionJpaRepository instructionJpaRepository,
            TourneePlanifieeJpaRepository tourneePlanifieeJpaRepository,
            ProcessedEventJpaRepository processedEventJpaRepository,
            DevEventBridge devEventBridge
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueTourneeJpaRepository = vueTourneeJpaRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.incidentVueJpaRepository = incidentVueJpaRepository;
        this.instructionJpaRepository = instructionJpaRepository;
        this.tourneePlanifieeJpaRepository = tourneePlanifieeJpaRepository;
        this.processedEventJpaRepository = processedEventJpaRepository;
        this.devEventBridge = devEventBridge;
    }

    @Override
    public void run(String... args) {
        seed();
    }

    /**
     * Initialise les données de test. Idempotent : skip si des données existent déjà.
     * Appeler reinitialiser() avant seed() pour forcer un re-seed complet.
     */
    public void seed() {
        // Idempotence : skip si des VueTournee existent déjà (redémarrage sans reset)
        if (vueTourneeJpaRepository.count() > 0) {
            log.info("[DevDataSeeder] Données déjà présentes — skip (idempotent)");
            return;
        }

        // ─── VueTournees alignées avec svc-tournee DevDataSeeder (BC-01) ─────────

        // tournee-dev-001 : Pierre Martin (livreur-001), 5 colis, EN_COURS
        vueTourneeRepository.save(new VueTournee(
                "tournee-dev-001", "Pierre Martin",
                0, 5, StatutTourneeVue.EN_COURS,
                Instant.now(), "T-DEV-001", "Lyon"
        ));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-001", "colis-dev-001",
                "12 Rue du Port, 69003 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-001", "colis-dev-002",
                "4 Allee des Roses Apt 12, 69006 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-001", "colis-dev-003",
                "8 Cours Gambetta, 69007 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-001", "colis-dev-004",
                "23 Avenue Jean Jaures Bat C, 69007 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-001", "colis-dev-005",
                "7 Rue de la Republique, 69002 Lyon", "A_LIVRER", null, null));

        // tournee-dev-003 : Marie Lambert (livreur-003), 3 colis, EN_COURS
        vueTourneeRepository.save(new VueTournee(
                "tournee-dev-003", "Marie Lambert",
                0, 3, StatutTourneeVue.EN_COURS,
                Instant.now().minusSeconds(600), "T-DEV-003", "Lyon 3e"
        ));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-003", "colis-dev-003-001",
                "10 Rue de la Part-Dieu, 69003 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-003", "colis-dev-003-002",
                "22 Avenue de Saxe Apt 8, 69003 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-003", "colis-dev-003-003",
                "3 Rue de la Barre, 69002 Lyon", "A_LIVRER", null, null));

        // tournee-dev-004 : Jean Moreau (livreur-004), 6 colis, A_RISQUE (2 traités)
        vueTourneeRepository.save(new VueTournee(
                "tournee-dev-004", "Jean Moreau",
                2, 6, StatutTourneeVue.A_RISQUE,
                Instant.now().minusSeconds(3600), "T-DEV-004", "Lyon 3e"
        ));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-004", "colis-dev-004-001",
                "45 Cours Lafayette, 69003 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-004", "colis-dev-004-002",
                "8 Rue Moncey Bat A, 69003 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-004", "colis-dev-004-003",
                "17 Boulevard des Brotteaux, 69006 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-004", "colis-dev-004-004",
                "29 Rue Vendome 2eme etage, 69006 Lyon", "A_LIVRER", null, null));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-004", "colis-dev-004-005",
                "6 Place des Terreaux, 69001 Lyon", "LIVRE", null, Instant.now().minusSeconds(5000)));
        vueColisJpaRepository.save(new VueColisEntity("tournee-dev-004", "colis-dev-004-006",
                "14 Rue Saint-Jean, 69005 Lyon", "ECHEC", "ACCES_IMPOSSIBLE",
                Instant.now().minusSeconds(4000)));

        // Incident pour tournee-dev-004
        incidentVueJpaRepository.save(new IncidentVueEntity("tournee-dev-004", "colis-dev-004-006",
                "14 Rue Saint-Jean, 69005 Lyon", "ACCES_IMPOSSIBLE",
                Instant.now().minusSeconds(4000), "Portail electrique en panne"));

        // Instructions pour tournee-dev-001 (Pierre Martin) — US-015
        instructionJpaRepository.save(new InstructionEntity(
                "instr-dev-001", "tournee-dev-001", "colis-dev-003",
                "superviseur-001", TypeInstruction.PRIORISER, null,
                StatutInstruction.ENVOYEE, Instant.now().minusSeconds(900)
        ));
        instructionJpaRepository.save(new InstructionEntity(
                "instr-dev-002", "tournee-dev-001", "colis-dev-001",
                "superviseur-001", TypeInstruction.ANNULER, null,
                StatutInstruction.EXECUTEE, Instant.now().minusSeconds(2000)
        ));

        // ─── BC-07 Planification — Plan du jour (US-021 à US-024) ────────────────
        // Nettoyage préalable pour garantir des données fraîches (date du jour)
        tourneePlanifieeJpaRepository.deleteAll();

        LocalDate today = LocalDate.now();
        Instant importHeure = Instant.now().minusSeconds(3600);

        // Tournée T-201 : NON_AFFECTEE, 34 colis, Lyon 3e/6e, pas d'anomalie
        TourneePlanifiee tp201 = new TourneePlanifiee(
                "tp-201", "T-201", today, 34,
                java.util.List.of(new ZoneTournee("Lyon 3e", 20), new ZoneTournee("Lyon 6e", 14)),
                java.util.List.of(new ContrainteHoraire("Livraison avant 10h00", 5)),
                java.util.List.of(),
                importHeure
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp201));

        // Tournée T-202 : AFFECTEE, 28 colis, Villeurbanne
        TourneePlanifiee tp202 = new TourneePlanifiee(
                "tp-202", "T-202", today, 28,
                java.util.List.of(new ZoneTournee("Villeurbanne", 28)),
                java.util.List.of(),
                java.util.List.of(),
                importHeure,
                StatutAffectation.AFFECTEE,
                "livreur-004", "Jean Moreau", "VH-04",
                importHeure.plusSeconds(600), null, true
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp202));

        // Tournée T-203 : NON_AFFECTEE, 41 colis, SURCHARGE anomalie
        TourneePlanifiee tp203 = new TourneePlanifiee(
                "tp-203", "T-203", today, 41,
                java.util.List.of(new ZoneTournee("Lyon 8e", 27), new ZoneTournee("Lyon 5e", 14)),
                java.util.List.of(new ContrainteHoraire("Livraison avant 10h00", 6), new ContrainteHoraire("Livraison avant 12h00", 3)),
                java.util.List.of(new Anomalie("SURCHARGE", "41 colis dépasse le seuil de 35 pour ce type de tournée (zone péri-urbaine). Vérifier avant de lancer.")),
                importHeure
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp203));

        // Tournée T-204 : LANCEE, 22 colis, Lyon 2e
        TourneePlanifiee tp204 = new TourneePlanifiee(
                "tp-204", "T-204", today, 22,
                java.util.List.of(new ZoneTournee("Lyon 2e", 22)),
                java.util.List.of(),
                java.util.List.of(),
                importHeure,
                StatutAffectation.LANCEE,
                "livreur-002", "Paul Dupont", "VH-03",
                importHeure.plusSeconds(300), importHeure.plusSeconds(900), false
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp204));

        // VueTournee T-204 propagée via DevEventBridge (US-048)
        TourneeLancee eventT204 = new TourneeLancee(
                "tp-204", "T-204", "livreur-002", "Paul Dupont",
                "seeder-dev", Instant.now(), 22
        );
        devEventBridge.propaguerTourneeLancee(eventT204);

        // US-049 : livreur-005 Sophie Bernard — T-205 AFFECTEE
        TourneePlanifiee tp205 = new TourneePlanifiee(
                "tp-205", "T-205", today, 4,
                java.util.List.of(new ZoneTournee("Lyon 4e", 4)),
                java.util.List.of(),
                java.util.List.of(),
                importHeure,
                StatutAffectation.AFFECTEE,
                "livreur-005", "Sophie Bernard", "VH-05",
                importHeure.plusSeconds(450), null, false
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp205));

        // US-049 : livreur-006 Lucas Petit — T-206 AFFECTEE
        TourneePlanifiee tp206 = new TourneePlanifiee(
                "tp-206", "T-206", today, 3,
                java.util.List.of(new ZoneTournee("Lyon 7e", 3)),
                java.util.List.of(),
                java.util.List.of(),
                importHeure,
                StatutAffectation.AFFECTEE,
                "livreur-006", "Lucas Petit", "VH-06",
                importHeure.plusSeconds(480), null, false
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp206));

        log.info("[DevDataSeeder] Données de test initialisées (3 VueTournees + planification)");
    }

    /**
     * Réinitialise toutes les données dev (utilisé par DELETE /dev/tms/reset et POST /dev/tms/full-reset).
     * Efface aussi processed_events pour permettre le re-traitement des événements TOURNEE_DEMARREE.
     */
    public void reinitialiser() {
        instructionJpaRepository.deleteAll();
        incidentVueJpaRepository.deleteAll();
        vueColisJpaRepository.deleteAll();
        vueTourneeJpaRepository.deleteAll();
        tourneePlanifieeJpaRepository.deleteAll();
        processedEventJpaRepository.deleteAll();
    }
}
