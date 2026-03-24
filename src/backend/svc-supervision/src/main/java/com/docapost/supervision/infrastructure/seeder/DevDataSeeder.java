package com.docapost.supervision.infrastructure.seeder;

import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.persistence.*;
import com.docapost.supervision.infrastructure.planification.TourneePlanifieeJpaRepository;
import com.docapost.supervision.infrastructure.planification.TourneePlanifieeMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DevDataSeeder — Données de test pour le profil dev (US-011).
 *
 * Crée 3 VueTournee de test :
 * - tournee-sup-001 : EN_COURS (Pierre Martin, 3/10 colis, 30%)
 * - tournee-sup-002 : EN_COURS (Marie Lambert, 7/10 colis, 70%)
 * - tournee-sup-003 : A_RISQUE (Jean Moreau, 2/12 colis, 16%)
 *
 * Source : US-011 — "Tableau de bord des tournées en temps réel"
 */
@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private final VueTourneeRepository vueTourneeRepository;
    private final VueColisJpaRepository vueColisJpaRepository;
    private final IncidentVueJpaRepository incidentVueJpaRepository;
    private final InstructionJpaRepository instructionJpaRepository;
    private final TourneePlanifieeJpaRepository tourneePlanifieeJpaRepository;

    public DevDataSeeder(
            VueTourneeRepository vueTourneeRepository,
            VueColisJpaRepository vueColisJpaRepository,
            IncidentVueJpaRepository incidentVueJpaRepository,
            InstructionJpaRepository instructionJpaRepository,
            TourneePlanifieeJpaRepository tourneePlanifieeJpaRepository
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.incidentVueJpaRepository = incidentVueJpaRepository;
        this.instructionJpaRepository = instructionJpaRepository;
        this.tourneePlanifieeJpaRepository = tourneePlanifieeJpaRepository;
    }

    @Override
    public void run(String... args) {
        // Tournée 1 : EN_COURS, avancement normal
        VueTournee tournee1 = new VueTournee(
                "tournee-sup-001",
                "Pierre Martin",
                3, 10,
                StatutTourneeVue.EN_COURS,
                Instant.now().minusSeconds(1800)
        );
        vueTourneeRepository.save(tournee1);

        // Tournée 2 : EN_COURS, bon avancement
        VueTournee tournee2 = new VueTournee(
                "tournee-sup-002",
                "Marie Lambert",
                7, 10,
                StatutTourneeVue.EN_COURS,
                Instant.now().minusSeconds(600)
        );
        vueTourneeRepository.save(tournee2);

        // Tournée 3 : A_RISQUE — retard détecté
        VueTournee tournee3 = new VueTournee(
                "tournee-sup-003",
                "Jean Moreau",
                2, 12,
                StatutTourneeVue.A_RISQUE,
                Instant.now().minusSeconds(3600)
        );
        vueTourneeRepository.save(tournee3);

        // Colis pour tournée 1 (détail US-012)
        vueColisJpaRepository.save(new VueColisEntity("tournee-sup-001", "colis-s-001",
                "12 rue de la Paix, Paris", "LIVRE", null, Instant.now().minusSeconds(3000)));
        vueColisJpaRepository.save(new VueColisEntity("tournee-sup-001", "colis-s-002",
                "5 avenue Victor Hugo, Paris", "ECHEC", "ABSENT", Instant.now().minusSeconds(2400)));
        vueColisJpaRepository.save(new VueColisEntity("tournee-sup-001", "colis-s-003",
                "27 boulevard Haussmann, Paris", "A_LIVRER", null, null));

        // Incidents pour tournée 1
        incidentVueJpaRepository.save(new IncidentVueEntity("tournee-sup-001", "colis-s-002",
                "5 avenue Victor Hugo, Paris", "ABSENT",
                Instant.now().minusSeconds(2400), "Sonnette hors service"));

        // Colis pour tournée 3 (A_RISQUE — détail avec incidents)
        vueColisJpaRepository.save(new VueColisEntity("tournee-sup-003", "colis-s-010",
                "3 rue du Commerce, Lyon", "LIVRE", null, Instant.now().minusSeconds(5000)));
        vueColisJpaRepository.save(new VueColisEntity("tournee-sup-003", "colis-s-011",
                "8 place Bellecour, Lyon", "ECHEC", "ACCES_IMPOSSIBLE",
                Instant.now().minusSeconds(4000)));
        vueColisJpaRepository.save(new VueColisEntity("tournee-sup-003", "colis-s-012",
                "15 rue de la République, Lyon", "A_LIVRER", null, null));

        // Incident pour tournée 3
        incidentVueJpaRepository.save(new IncidentVueEntity("tournee-sup-003", "colis-s-011",
                "8 place Bellecour, Lyon", "ACCES_IMPOSSIBLE",
                Instant.now().minusSeconds(4000), "Portail électrique en panne"));

        // ─── BC-07 Planification — Plan du jour (US-021 à US-024) ────────────────

        LocalDate today = LocalDate.now();
        Instant importHeure = Instant.now().minusSeconds(3600); // simulé : importé à 06h14

        // Tournée T-201 : NON_AFFECTEE, 34 colis, Lyon 3e/6e, pas d'anomalie
        TourneePlanifiee tp201 = new TourneePlanifiee(
                "tp-201", "T-201", today, 34,
                java.util.List.of(new ZoneTournee("Lyon 3e", 20), new ZoneTournee("Lyon 6e", 14)),
                java.util.List.of(new ContrainteHoraire("Livraison avant 10h00", 5)),
                java.util.List.of(),
                importHeure
        );
        tourneePlanifieeJpaRepository.save(TourneePlanifieeMapper.toEntity(tp201));

        // Tournée T-202 : AFFECTEE, 28 colis, Villeurbanne, pas d'anomalie
        TourneePlanifiee tp202 = new TourneePlanifiee(
                "tp-202", "T-202", today, 28,
                java.util.List.of(new ZoneTournee("Villeurbanne", 28)),
                java.util.List.of(),
                java.util.List.of(),
                importHeure,
                StatutAffectation.AFFECTEE,
                "livreur-001", "Pierre Martin", "VH-07",
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

        // Instructions pour tournée 1 — US-015 (une ENVOYEE, une EXECUTEE)
        instructionJpaRepository.save(new InstructionEntity(
                "instr-dev-001", "tournee-sup-001", "colis-s-003",
                "superviseur-001", TypeInstruction.PRIORISER, null,
                StatutInstruction.ENVOYEE, Instant.now().minusSeconds(900)
        ));
        instructionJpaRepository.save(new InstructionEntity(
                "instr-dev-002", "tournee-sup-001", "colis-s-001",
                "superviseur-001", TypeInstruction.ANNULER, null,
                StatutInstruction.EXECUTEE, Instant.now().minusSeconds(2000)
        ));
    }
}
