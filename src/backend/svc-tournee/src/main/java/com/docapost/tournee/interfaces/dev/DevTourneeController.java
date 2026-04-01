package com.docapost.tournee.interfaces.dev;

import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * DevTourneeController — Endpoint récepteur pour le simulateur TMS (profil dev uniquement).
 *
 * US-033 : Reçoit les demandes de création de tournée de la part du DevEventBridge
 * (svc-supervision) lorsqu'une TourneeLancee est propagée en dev.
 *
 * Endpoint :
 * - POST /internal/dev/tournees : crée une Tournee dans svc-tournee avec des colis fictifs réalistes.
 *
 * Idempotence :
 * - Si la Tournee avec ce tourneeId existe déjà, retourne 200 OK sans modification.
 *   Un log INFO "TourneeDejaCree idempotence tourneeId=..." est émis.
 *
 * Invariants BC-01 respectés :
 * - Une Tournee nécessite un livreurId valide.
 * - Une Tournee doit avoir au moins un Colis.
 *
 * Invariant prod : ce contrôleur n'existe pas en profil "prod" (@Profile("dev")).
 *
 * Source : US-033 — SC3, SC5, SC6
 */
@RestController
@RequestMapping("/internal/dev")
@Profile("dev")
public class DevTourneeController {

    private static final Logger log = LoggerFactory.getLogger(DevTourneeController.class);

    // Adresses fictives réalistes (Lyon)
    private static final List<String[]> ADRESSES_FICTIVES = List.of(
            new String[]{"12 rue de la Paix", null, "69001", "Lyon", "Lyon 1er"},
            new String[]{"5 avenue Victor Hugo", null, "69002", "Lyon", "Lyon 2e"},
            new String[]{"27 boulevard Haussmann", "Bât A", "69003", "Lyon", "Lyon 3e"},
            new String[]{"8 place Bellecour", null, "69002", "Lyon", "Lyon 2e"},
            new String[]{"3 rue du Commerce", null, "69007", "Lyon", "Lyon 7e"},
            new String[]{"15 rue de la République", "2ème étage", "69002", "Lyon", "Lyon 2e"},
            new String[]{"42 cours Lafayette", null, "69003", "Lyon", "Lyon 3e"},
            new String[]{"18 rue Garibaldi", "Digicode 4521", "69006", "Lyon", "Lyon 6e"},
            new String[]{"7 quai de la Saône", null, "69005", "Lyon", "Lyon 5e"},
            new String[]{"33 avenue Berthelot", null, "69007", "Lyon", "Lyon 7e"}
    );

    // Destinataires fictifs réalistes
    private static final List<String[]> DESTINATAIRES = List.of(
            new String[]{"Mme Camille Renard", "06 12 34 56 78"},
            new String[]{"M. Julien Moreau", "06 23 45 67 89"},
            new String[]{"Mme Sophie Bernard", "07 34 56 78 90"},
            new String[]{"M. Antoine Girard", "06 45 67 89 01"},
            new String[]{"Mme Isabelle Blanc", "07 56 78 90 12"},
            new String[]{"M. Marc Dupont", "06 67 89 01 23"},
            new String[]{"Mme Nathalie Roux", "07 78 90 12 34"},
            new String[]{"M. Pierre Lambert", "06 89 01 23 45"},
            new String[]{"Mme Claire Fontaine", "07 90 12 34 56"},
            new String[]{"M. Yves Garnier", "06 01 23 45 67"}
    );

    private final TourneeRepository tourneeRepository;
    private final Random random = new Random();

    public DevTourneeController(TourneeRepository tourneeRepository) {
        this.tourneeRepository = tourneeRepository;
    }

    /**
     * SC3/SC6 — Créer une Tournee dans BC-01 (ou retourner 200 si elle existe déjà).
     *
     * Body attendu :
     * {
     *   "tourneeId": "T-2026-0042",
     *   "livreurId": "livreur-007",
     *   "livreurNom": "Jean Dupont",
     *   "nbColis": 5
     * }
     *
     * @return 201 Created si création, 200 OK si idempotence
     */
    @PostMapping("/tournees")
    public ResponseEntity<Map<String, Object>> creerTourneeDevTms(
            @RequestBody CreerTourneeDevRequest request
    ) {
        TourneeId tourneeId = new TourneeId(request.tourneeId());
        LivreurId livreurId = new LivreurId(request.livreurId());

        // SC6 : Idempotence — même tourneeId déjà créé : ne rien faire
        if (tourneeRepository.findById(tourneeId).isPresent()) {
            log.info("[DevTourneeController] TourneeDejaCree idempotence tourneeId={}", request.tourneeId());
            return ResponseEntity.ok(Map.of(
                    "tourneeId", request.tourneeId(),
                    "statut", "DEJA_EXISTANTE"
            ));
        }

        // Remplacer toute tournée existante pour ce livreur aujourd'hui (ex. tournée seed)
        // afin que la tournée lancée depuis la supervision soit toujours celle visible côté mobile.
        tourneeRepository.findByLivreurIdAndDate(livreurId, LocalDate.now()).ifPresent(old -> {
            log.info("[DevTourneeController] Suppression de la tournee precedente livreurId={} tourneeId={}",
                    request.livreurId(), old.getId().value());
            tourneeRepository.deleteByLivreurIdAndDate(livreurId, LocalDate.now());
        });

        // Générer les colis fictifs réalistes
        int nbColis = request.nbColis() > 0 ? request.nbColis() : 5;
        List<Colis> colisList = genererColis(tourneeId, nbColis);

        // Créer l'agrégat Tournee (BC-01)
        Tournee tournee = new Tournee(
                tourneeId,
                livreurId,
                LocalDate.now(),
                colisList,
                StatutTournee.CHARGEE
        );

        tourneeRepository.save(tournee);
        log.info("[DevTourneeController] Tournee creee tourneeId={} livreurId={} nbColis={}",
                request.tourneeId(), request.livreurId(), nbColis);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "tourneeId", request.tourneeId(),
                "statut", "CREEE",
                "nbColis", nbColis
        ));
    }

    // ─── Génération de colis fictifs réalistes ────────────────────────────────

    private List<Colis> genererColis(TourneeId tourneeId, int nbColis) {
        List<Colis> colisList = new ArrayList<>();
        int nbAdresses = ADRESSES_FICTIVES.size();
        int nbDestinataires = DESTINATAIRES.size();

        for (int i = 0; i < nbColis; i++) {
            String colisId = tourneeId.value() + "-C-" + String.format("%03d", i + 1);
            String[] adresse = ADRESSES_FICTIVES.get(i % nbAdresses);
            String[] destinataire = DESTINATAIRES.get(i % nbDestinataires);

            // Contrainte horaire sur certains colis (environ 30%)
            List<Contrainte> contraintes = new ArrayList<>();
            if (random.nextInt(10) < 3) {
                contraintes.add(new Contrainte(TypeContrainte.HORAIRE, "Livraison avant 10h00"));
            }

            colisList.add(new Colis(
                    new ColisId(colisId),
                    tourneeId,
                    StatutColis.A_LIVRER,
                    new Adresse(
                            adresse[0],
                            adresse[1],
                            adresse[2],
                            adresse[3],
                            adresse[4]
                    ),
                    new Destinataire(destinataire[0], destinataire[1]),
                    contraintes
            ));
        }
        return colisList;
    }

    // ─── DTO interne ──────────────────────────────────────────────────────────

    public record CreerTourneeDevRequest(
            String tourneeId,
            String livreurId,
            String livreurNom,
            int nbColis
    ) {}
}
