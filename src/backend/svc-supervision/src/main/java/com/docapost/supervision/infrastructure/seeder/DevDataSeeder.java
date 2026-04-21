package com.docapost.supervision.infrastructure.seeder;

import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.broadcast.BroadcastSecteurEntity;
import com.docapost.supervision.infrastructure.broadcast.BroadcastSecteurJpaRepository;
import com.docapost.supervision.infrastructure.broadcast.FcmTokenEntity;
import com.docapost.supervision.infrastructure.broadcast.FcmTokenJpaRepository;
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
 * DevDataSeeder — Données de test pour les profils dev et recette (US-011).
 *
 * Toutes les tournées utilisent le format unifié T-2xx / tp-2xx.
 * Les VueTournees sont créées exclusivement via DevEventBridge (événement TourneeLancee)
 * pour les tournées à statut LANCEE — aucune VueTournee créée en dur.
 *
 * État résultant des 6 livreurs :
 * - livreur-001 (Pierre Martin)  : SANS_TOURNEE
 * - livreur-002 (Paul Dupont)    : EN_COURS      (T-204 LANCEE)
 * - livreur-003 (Marie Lambert)  : SANS_TOURNEE
 * - livreur-004 (Jean Moreau)    : EN_COURS      (T-202 LANCEE, A_RISQUE)
 * - livreur-005 (Sophie Bernard) : AFFECTE_NON_LANCE (T-205)
 * - livreur-006 (Lucas Petit)    : AFFECTE_NON_LANCE (T-206)
 *
 * Idempotent : skip si des VueTournee existent déjà (ex. redémarrage sans reset).
 * Appeler reinitialiser() puis seed() pour forcer un re-seed complet.
 *
 * Source : US-011, US-049, US-066
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
    private final BroadcastSecteurJpaRepository broadcastSecteurJpaRepository;
    private final FcmTokenJpaRepository fcmTokenJpaRepository;

    public DevDataSeeder(
            VueTourneeRepository vueTourneeRepository,
            VueTourneeJpaRepository vueTourneeJpaRepository,
            VueColisJpaRepository vueColisJpaRepository,
            IncidentVueJpaRepository incidentVueJpaRepository,
            InstructionJpaRepository instructionJpaRepository,
            TourneePlanifieeJpaRepository tourneePlanifieeJpaRepository,
            ProcessedEventJpaRepository processedEventJpaRepository,
            DevEventBridge devEventBridge,
            BroadcastSecteurJpaRepository broadcastSecteurJpaRepository,
            FcmTokenJpaRepository fcmTokenJpaRepository
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueTourneeJpaRepository = vueTourneeJpaRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.incidentVueJpaRepository = incidentVueJpaRepository;
        this.instructionJpaRepository = instructionJpaRepository;
        this.tourneePlanifieeJpaRepository = tourneePlanifieeJpaRepository;
        this.processedEventJpaRepository = processedEventJpaRepository;
        this.devEventBridge = devEventBridge;
        this.broadcastSecteurJpaRepository = broadcastSecteurJpaRepository;
        this.fcmTokenJpaRepository = fcmTokenJpaRepository;
    }

    @Override
    public void run(String... args) {
        seed();
    }

    /**
     * Initialise les données de test. Idempotent : skip si des TourneePlanifiee existent déjà pour aujourd'hui.
     * Si la date a changé (ex. redéploiement le lendemain), toutes les données sont réinitialisées
     * et re-seedées avec la date du jour pour garantir la cohérence.
     * Appeler reinitialiser() avant seed() pour forcer un re-seed complet.
     */
    public void seed() {
        LocalDate today = LocalDate.now();

        // Idempotence : skip uniquement si les TourneePlanifiee du jour sont déjà présentes.
        // Si la base contient des données d'un autre jour (ex. redéploiement), on réinitialise tout
        // pour éviter que les livreurs apparaissent "non affectés" à cause de dates périmées.
        if (!tourneePlanifieeJpaRepository.findByDate(today).isEmpty()) {
            log.info("[DevDataSeeder] TourneePlanifiees du jour ({}) déjà présentes — skip (idempotent)", today);
            return;
        }

        // ─── BC-07 Planification — Plan du jour (US-021 à US-024) ────────────────
        // Nettoyage complet avant re-seed (données périmées ou première initialisation)
        reinitialiser();

        Instant importHeure = Instant.now().minusSeconds(3600);

        // T-201 : NON_AFFECTEE, 34 colis, Lyon 3e/6e, pas d'anomalie
        TourneePlanifiee tp201 = new TourneePlanifiee(
                "tp-201", "T-201", today, 34,
                java.util.List.of(new ZoneTournee("Lyon 3e", 20), new ZoneTournee("Lyon 6e", 14)),
                java.util.List.of(new ContrainteHoraire("Livraison avant 10h00", 5)),
                java.util.List.of(),
                importHeure
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp201));

        // T-202 : LANCEE, 28 colis, Villeurbanne — livreur-004 Jean Moreau (A_RISQUE)
        TourneePlanifiee tp202 = new TourneePlanifiee(
                "tp-202", "T-202", today, 28,
                java.util.List.of(new ZoneTournee("Villeurbanne", 28)),
                java.util.List.of(),
                java.util.List.of(),
                importHeure,
                StatutAffectation.LANCEE,
                "livreur-004", "Jean Moreau", "VH-04",
                importHeure.plusSeconds(600), importHeure.plusSeconds(1200), true
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp202));

        // VueTournee T-202 propagée via DevEventBridge
        TourneeLancee eventT202 = new TourneeLancee(
                "tp-202", "T-202", "livreur-004", "Jean Moreau",
                "seeder-dev", Instant.now().minusSeconds(3600), 28
        );
        devEventBridge.propaguerTourneeLancee(eventT202);

        // Incident A_RISQUE sur T-202 — colis en échec accès impossible
        incidentVueJpaRepository.save(new IncidentVueEntity("T-202", "T-202-C-005",
                "14 Rue Saint-Jean, 69005 Villeurbanne", "ACCES_IMPOSSIBLE",
                Instant.now().minusSeconds(2000), "Portail électrique en panne"));

        // Instructions sur T-202 (Jean Moreau) — US-015
        instructionJpaRepository.save(new InstructionEntity(
                "instr-dev-001", "T-202", "T-202-C-005",
                "superviseur-001", TypeInstruction.PRIORISER, null,
                StatutInstruction.ENVOYEE, Instant.now().minusSeconds(900)
        ));

        // T-203 : NON_AFFECTEE, 41 colis, anomalie SURCHARGE
        TourneePlanifiee tp203 = new TourneePlanifiee(
                "tp-203", "T-203", today, 41,
                java.util.List.of(new ZoneTournee("Lyon 8e", 27), new ZoneTournee("Lyon 5e", 14)),
                java.util.List.of(new ContrainteHoraire("Livraison avant 10h00", 6), new ContrainteHoraire("Livraison avant 12h00", 3)),
                java.util.List.of(new Anomalie("SURCHARGE", "41 colis dépasse le seuil de 35 pour ce type de tournée (zone péri-urbaine). Vérifier avant de lancer.")),
                importHeure
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp203));

        // T-204 : LANCEE, 22 colis, Lyon 2e — livreur-002 Paul Dupont (EN_COURS)
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

        // VueTournee T-204 propagée via DevEventBridge
        TourneeLancee eventT204 = new TourneeLancee(
                "tp-204", "T-204", "livreur-002", "Paul Dupont",
                "seeder-dev", Instant.now(), 22
        );
        devEventBridge.propaguerTourneeLancee(eventT204);

        // Instructions sur T-204 (Paul Dupont) — US-015
        instructionJpaRepository.save(new InstructionEntity(
                "instr-dev-002", "T-204", "T-204-C-003",
                "superviseur-001", TypeInstruction.ANNULER, null,
                StatutInstruction.EXECUTEE, Instant.now().minusSeconds(2000)
        ));

        // T-205 : AFFECTEE, 4 colis, Lyon 4e — livreur-005 Sophie Bernard
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

        // T-206 : AFFECTEE, 3 colis, Lyon 7e — livreur-006 Lucas Petit
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

        log.info("[DevDataSeeder] Données initialisées — 2 LANCEE (T-202, T-204), 2 AFFECTEE (T-205, T-206), 2 NON_AFFECTEE (T-201, T-203)");

        // ─── BC-03 Broadcast — Secteurs et tokens FCM (US-067) ───────────────────
        if (broadcastSecteurJpaRepository.count() == 0) {
            broadcastSecteurJpaRepository.save(new BroadcastSecteurEntity("SECT-IDF-01", "Secteur 1 — Nord Essonne", true));
            broadcastSecteurJpaRepository.save(new BroadcastSecteurEntity("SECT-IDF-02", "Secteur 2 — Sud Essonne", true));
            broadcastSecteurJpaRepository.save(new BroadcastSecteurEntity("SECT-IDF-03", "Secteur 3 — Val-de-Marne", true));
            log.info("[DevDataSeeder] 3 secteurs broadcast insérés");
        }

        if (fcmTokenJpaRepository.count() == 0) {
            for (String livreurId : java.util.List.of(
                    "livreur-001", "livreur-002", "livreur-003",
                    "livreur-004", "livreur-005", "livreur-006")) {
                fcmTokenJpaRepository.save(new FcmTokenEntity(
                        livreurId, "fake-fcm-token-" + livreurId, Instant.now()));
            }
            log.info("[DevDataSeeder] 6 tokens FCM fictifs insérés");
        }
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
