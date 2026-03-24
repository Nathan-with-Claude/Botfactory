package com.docapost.supervision.infrastructure.seeder;

import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.persistence.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;

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

    public DevDataSeeder(
            VueTourneeRepository vueTourneeRepository,
            VueColisJpaRepository vueColisJpaRepository,
            IncidentVueJpaRepository incidentVueJpaRepository,
            InstructionJpaRepository instructionJpaRepository
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.incidentVueJpaRepository = incidentVueJpaRepository;
        this.instructionJpaRepository = instructionJpaRepository;
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
