package com.docapost.supervision.interfaces.dev;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.infrastructure.seeder.DevDataSeeder;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

/**
 * DevTmsController — Simulateur d'import TMS (profil dev uniquement).
 *
 * US-033 : Permet d'injecter des TourneesPlanifiees simulées sans TMS réel,
 * et de repartir de zéro via DELETE /dev/tms/reset.
 *
 * Deux endpoints :
 * - POST /dev/tms/import : génère N TourneesPlanifiees réalistes et les persiste.
 * - DELETE /dev/tms/reset : vide toutes les TourneesPlanifiee et VueTournee.
 *
 * Invariant prod : ce contrôleur n'existe pas en profil "prod" (@Profile("dev")).
 *
 * Source : US-033 — SC1, SC4
 */
@RestController
@RequestMapping("/dev/tms")
@Profile("dev")
public class DevTmsController {

    private static final Random RANDOM = new Random();

    // Zones réalistes pour la génération
    private static final List<String> ZONES = List.of(
            "Lyon 1er", "Lyon 2e", "Lyon 3e", "Lyon 4e", "Lyon 5e",
            "Lyon 6e", "Lyon 7e", "Lyon 8e", "Lyon 9e",
            "Villeurbanne", "Caluire", "Bron", "Vénissieux"
    );

    // Prénoms et noms pour les livreurs simulés
    private static final List<String> PRENOMS = List.of(
            "Pierre", "Marie", "Jean", "Sophie", "Paul", "Laura",
            "Thomas", "Isabelle", "François", "Claire"
    );
    private static final List<String> NOMS = List.of(
            "Martin", "Dupont", "Bernard", "Leroy", "Moreau",
            "Lambert", "Girard", "Roux", "Blanc", "Fournier"
    );

    private final TourneePlanifieeRepository tourneePlanifieeRepository;
    private final DevDataSeeder devDataSeeder;

    public DevTmsController(
            TourneePlanifieeRepository tourneePlanifieeRepository,
            DevDataSeeder devDataSeeder
    ) {
        this.tourneePlanifieeRepository = tourneePlanifieeRepository;
        this.devDataSeeder = devDataSeeder;
    }

    /**
     * SC1 — Importer des TourneesPlanifiees simulées.
     *
     * Body attendu : { "nombre": 3, "date": "2026-03-27" }
     *
     * Chaque tournée générée contient :
     * - entre 3 et 8 colis
     * - 1 à 2 zones géographiques
     * - éventuellement des contraintes horaires
     * - un codeTms unique au format "T-SIM-{uuid_court}"
     *
     * @return 201 Created avec { "tourneesCreees": N }
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importerTournees(@RequestBody ImportTmsRequest request) {
        if (request.nombre() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "Le nombre de tournées doit être > 0"));
        }

        LocalDate date = request.date() != null ? request.date() : LocalDate.now();
        int crees = 0;

        for (int i = 0; i < request.nombre(); i++) {
            TourneePlanifiee tournee = genererTourneePlanifiee(date, i);
            tourneePlanifieeRepository.save(tournee);
            crees++;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tourneesCreees", crees);
        response.put("date", date.toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Vide toutes les TourneesPlanifiees et VueTournee.
     * Permet de repartir de zéro pour les tests E2E.
     *
     * @return 204 No Content
     */
    @DeleteMapping("/reset")
    public ResponseEntity<Void> reset() {
        devDataSeeder.reinitialiser();
        return ResponseEntity.noContent().build();
    }

    // ─── Génération réaliste ──────────────────────────────────────────────────

    private TourneePlanifiee genererTourneePlanifiee(LocalDate date, int index) {
        String id = "tp-sim-" + UUID.randomUUID().toString().substring(0, 8);
        String codeTms = "T-SIM-" + String.format("%04d", (index + 1) + (int)(Math.random() * 9000));
        int nbColis = 3 + RANDOM.nextInt(6); // entre 3 et 8

        // 1 ou 2 zones
        List<ZoneTournee> zones = genererZones(nbColis);

        // Contraintes horaires (50% de chance)
        List<ContrainteHoraire> contraintes = new ArrayList<>();
        if (RANDOM.nextBoolean()) {
            int nbColisContrainte = 1 + RANDOM.nextInt(Math.min(3, nbColis));
            contraintes.add(new ContrainteHoraire("Livraison avant 10h00", nbColisContrainte));
        }

        // Anomalies (10% de chance — surcharge)
        List<Anomalie> anomalies = new ArrayList<>();
        if (nbColis >= 7 && RANDOM.nextInt(10) < 2) {
            anomalies.add(new Anomalie("SURCHARGE",
                    nbColis + " colis dépasse le seuil recommandé pour ce secteur."));
        }

        return new TourneePlanifiee(
                id,
                codeTms,
                date,
                nbColis,
                zones,
                contraintes,
                anomalies,
                Instant.now().minusSeconds(RANDOM.nextInt(3600))
        );
    }

    private List<ZoneTournee> genererZones(int nbColisTotal) {
        if (nbColisTotal <= 4 || RANDOM.nextBoolean()) {
            // Une seule zone
            String zone = ZONES.get(RANDOM.nextInt(ZONES.size()));
            return List.of(new ZoneTournee(zone, nbColisTotal));
        } else {
            // Deux zones
            int split = nbColisTotal / 2;
            String zone1 = ZONES.get(RANDOM.nextInt(ZONES.size()));
            String zone2;
            do {
                zone2 = ZONES.get(RANDOM.nextInt(ZONES.size()));
            } while (zone2.equals(zone1));
            return List.of(
                    new ZoneTournee(zone1, split),
                    new ZoneTournee(zone2, nbColisTotal - split)
            );
        }
    }

    // ─── DTO interne ──────────────────────────────────────────────────────────

    public record ImportTmsRequest(int nombre, LocalDate date) {}
}
