package com.docapost.tournee.infrastructure.seeder;

import com.docapost.tournee.infrastructure.persistence.*;
import com.docapost.tournee.domain.model.StatutColis;
import com.docapost.tournee.domain.model.StatutTournee;
import com.docapost.tournee.domain.model.TypeContrainte;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DevDataSeeder — Initialise des donnees de test au demarrage en profil "dev".
 *
 * TEMPORAIRE — Remplace l'event TourneeLancee (BC-07 Planification, US-021 a US-024)
 * qui n'est pas encore implemente. Quand BC-07 sera implemente, ce seeder sera
 * supprime et la Tournee sera creee via le handler d'evenement TourneeLancee.
 *
 * Insere : 1 Tournee par livreur dev pour la date du jour :
 *   - livreur-001 : Pierre Martin  (5 colis)
 *   - livreur-002 : Paul Dupont    (4 colis)
 *   - livreur-003 : Marie Lambert  (3 colis)
 *   - livreur-004 : Jean Moreau    (6 colis)
 * Ne re-insere pas si la tournee existe deja pour un livreur (idempotent au demarrage).
 *
 * TODO : supprimer quand US-024 (LancerTourneeHandler) est implemente.
 */
@Component
@Profile({"dev", "recette"})
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final TourneeJpaRepository tourneeJpaRepository;

    public DevDataSeeder(TourneeJpaRepository tourneeJpaRepository) {
        this.tourneeJpaRepository = tourneeJpaRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        LocalDate today = LocalDate.now();
        seedLivreur001(today);
        seedLivreur002(today);
        seedLivreur003(today);
        seedLivreur004(today);
    }

    /**
     * Supprime toutes les tournées existantes et recrée les données de test.
     * Utilisé par POST /internal/dev/reseed (appelé par svc-supervision full-reset).
     */
    @Transactional
    public void resetAndReseed() {
        log.info("[DevDataSeeder] resetAndReseed — suppression de toutes les tournees...");
        tourneeJpaRepository.deleteAll();
        LocalDate today = LocalDate.now();
        seedLivreur001(today);
        seedLivreur002(today);
        seedLivreur003(today);
        seedLivreur004(today);
        log.info("[DevDataSeeder] resetAndReseed — terminé");
    }

    // ─── livreur-001 : Pierre Martin (5 colis) ────────────────────────────────

    private void seedLivreur001(LocalDate today) {
        final String livreurId = "livreur-001";
        if (tourneeJpaRepository.findByLivreurIdAndDate(livreurId, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", livreurId, today);
            return;
        }
        log.info("[DevDataSeeder] Creation de la tournee de test pour {} a {}...", livreurId, today);

        TourneeEntity tournee = new TourneeEntity("tournee-dev-001", livreurId, today, StatutTournee.CHARGEE);

        List<ColisEntity> colis = List.of(
                createColis("colis-dev-001", tournee, StatutColis.A_LIVRER,
                        "12 Rue du Port", null, "69003", "Lyon", "Zone A",
                        "M. Dupont", "0601020304",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 14h00"))
                ),
                createColis("colis-dev-002", tournee, StatutColis.A_LIVRER,
                        "4 Allee des Roses", "Apt 12", "69006", "Lyon", "Zone B",
                        "Mme Martin", "0607080910",
                        List.of()
                ),
                createColis("colis-dev-003", tournee, StatutColis.A_LIVRER,
                        "8 Cours Gambetta", null, "69007", "Lyon", "Zone B",
                        "M. Leroy", "0611121314",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Manipuler avec precaution"))
                ),
                createColis("colis-dev-004", tournee, StatutColis.LIVRE,
                        "23 Avenue Jean Jaures", "Bat C", "69007", "Lyon", "Zone C",
                        "Mme Benoit", "0622232425",
                        List.of()
                ),
                createColis("colis-dev-005", tournee, StatutColis.ECHEC,
                        "7 Rue de la Republique", null, "69002", "Lyon", "Zone A",
                        "M. Renard", "0633343536",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Document contractuel"))
                )
        );

        tournee.setColis(colis);
        tourneeJpaRepository.save(tournee);
        log.info("[DevDataSeeder] Tournee creee avec {} colis pour {}.", colis.size(), livreurId);
    }

    // ─── livreur-002 : Paul Dupont — Tournee T-204 (22 colis, aligné BC-07) ───
    // US-048 : ID T-204 pour correspondre à la TourneePlanifiee de svc-supervision.
    // Si DevEventBridge a déjà créé T-204 via propaguerTourneeLancee, l'idempotence
    // du DevTourneeController garantit qu'aucun doublon n'est créé.

    private void seedLivreur002(LocalDate today) {
        final String livreurId = "livreur-002";
        if (tourneeJpaRepository.findByLivreurIdAndDate(livreurId, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", livreurId, today);
            return;
        }
        log.info("[DevDataSeeder] Creation de la tournee de test pour {} a {}...", livreurId, today);

        TourneeEntity tournee = new TourneeEntity("T-204", livreurId, today, StatutTournee.CHARGEE);

        List<ColisEntity> colis = List.of(
                createColis("T-204-C-001", tournee, StatutColis.A_LIVRER,
                        "1 Rue de la Republique", null, "69002", "Lyon", "Lyon 2e",
                        "M. Arnaud", "0600000001", List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 10h00"))),
                createColis("T-204-C-002", tournee, StatutColis.A_LIVRER,
                        "2 Rue de la Republique", "Apt 2", "69002", "Lyon", "Lyon 2e",
                        "Mme Blanchard", "0600000002", List.of()),
                createColis("T-204-C-003", tournee, StatutColis.A_LIVRER,
                        "3 Quai des Celestins", null, "69002", "Lyon", "Lyon 2e",
                        "M. Collet", "0600000003", List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Verre"))),
                createColis("T-204-C-004", tournee, StatutColis.A_LIVRER,
                        "4 Rue Merciere", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Denis", "0600000004", List.of()),
                createColis("T-204-C-005", tournee, StatutColis.A_LIVRER,
                        "5 Place Bellecour", "Bat A", "69002", "Lyon", "Lyon 2e",
                        "M. Esposito", "0600000005", List.of()),
                createColis("T-204-C-006", tournee, StatutColis.A_LIVRER,
                        "6 Rue Saint-Nizier", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Faure", "0600000006", List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Contrat"))),
                createColis("T-204-C-007", tournee, StatutColis.A_LIVRER,
                        "7 Rue de Brest", "3eme etage", "69002", "Lyon", "Lyon 2e",
                        "M. Garcia", "0600000007", List.of()),
                createColis("T-204-C-008", tournee, StatutColis.A_LIVRER,
                        "8 Rue Grenette", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Henry", "0600000008", List.of()),
                createColis("T-204-C-009", tournee, StatutColis.A_LIVRER,
                        "9 Place des Jacobins", null, "69002", "Lyon", "Lyon 2e",
                        "M. Jacquot", "0600000009", List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Apres 11h00"))),
                createColis("T-204-C-010", tournee, StatutColis.A_LIVRER,
                        "10 Rue Auguste Comte", "Bat B", "69002", "Lyon", "Lyon 2e",
                        "Mme Klein", "0600000010", List.of()),
                createColis("T-204-C-011", tournee, StatutColis.A_LIVRER,
                        "11 Rue Victor Hugo", null, "69002", "Lyon", "Lyon 2e",
                        "M. Leclerc", "0600000011", List.of()),
                createColis("T-204-C-012", tournee, StatutColis.A_LIVRER,
                        "12 Rue de Condé", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Martin", "0600000012", List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Objets precieux"))),
                createColis("T-204-C-013", tournee, StatutColis.A_LIVRER,
                        "13 Rue Vaubecour", "Apt 5", "69002", "Lyon", "Lyon 2e",
                        "M. Nguyen", "0600000013", List.of()),
                createColis("T-204-C-014", tournee, StatutColis.A_LIVRER,
                        "14 Rue Sala", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Olivier", "0600000014", List.of()),
                createColis("T-204-C-015", tournee, StatutColis.A_LIVRER,
                        "15 Rue du Plat", null, "69002", "Lyon", "Lyon 2e",
                        "M. Perrin", "0600000015", List.of()),
                createColis("T-204-C-016", tournee, StatutColis.A_LIVRER,
                        "16 Rue Palais Grillet", "Bat C", "69002", "Lyon", "Lyon 2e",
                        "Mme Renard", "0600000016", List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 12h00"))),
                createColis("T-204-C-017", tournee, StatutColis.A_LIVRER,
                        "17 Rue des Marronniers", null, "69002", "Lyon", "Lyon 2e",
                        "M. Simon", "0600000017", List.of()),
                createColis("T-204-C-018", tournee, StatutColis.A_LIVRER,
                        "18 Quai Gailleton", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Thomas", "0600000018", List.of()),
                createColis("T-204-C-019", tournee, StatutColis.A_LIVRER,
                        "19 Rue Antoine de Saint-Exupery", null, "69002", "Lyon", "Lyon 2e",
                        "M. Urtado", "0600000019", List.of()),
                createColis("T-204-C-020", tournee, StatutColis.A_LIVRER,
                        "20 Rue Ferrandiere", "Apt 1", "69002", "Lyon", "Lyon 2e",
                        "Mme Valentin", "0600000020", List.of()),
                createColis("T-204-C-021", tournee, StatutColis.A_LIVRER,
                        "21 Rue des Remparts d Ainay", null, "69002", "Lyon", "Lyon 2e",
                        "M. Wagner", "0600000021", List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Avis recommande"))),
                createColis("T-204-C-022", tournee, StatutColis.A_LIVRER,
                        "22 Rue du Colonel Chambonnet", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Xavier", "0600000022", List.of())
        );

        tournee.setColis(colis);
        tourneeJpaRepository.save(tournee);
        log.info("[DevDataSeeder] Tournee creee avec {} colis pour {}.", colis.size(), livreurId);
    }

    // ─── livreur-003 : Marie Lambert (3 colis) ────────────────────────────────

    private void seedLivreur003(LocalDate today) {
        final String livreurId = "livreur-003";
        if (tourneeJpaRepository.findByLivreurIdAndDate(livreurId, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", livreurId, today);
            return;
        }
        log.info("[DevDataSeeder] Creation de la tournee de test pour {} a {}...", livreurId, today);

        TourneeEntity tournee = new TourneeEntity("tournee-dev-003", livreurId, today, StatutTournee.CHARGEE);

        List<ColisEntity> colis = List.of(
                createColis("colis-dev-003-001", tournee, StatutColis.A_LIVRER,
                        "10 Rue de la Part-Dieu", null, "69003", "Lyon", "Zone D",
                        "M. Rousseau", "0688899091",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Contrat — signature requise"))
                ),
                createColis("colis-dev-003-002", tournee, StatutColis.A_LIVRER,
                        "22 Avenue de Saxe", "Apt 8", "69003", "Lyon", "Zone D",
                        "Mme Chevalier", "0699000102",
                        List.of()
                ),
                createColis("colis-dev-003-003", tournee, StatutColis.A_LIVRER,
                        "3 Rue de la Barre", null, "69002", "Lyon", "Zone A",
                        "M. Morel", "0600010203",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 12h00"))
                )
        );

        tournee.setColis(colis);
        tourneeJpaRepository.save(tournee);
        log.info("[DevDataSeeder] Tournee creee avec {} colis pour {}.", colis.size(), livreurId);
    }

    // ─── livreur-004 : Jean Moreau (6 colis) ──────────────────────────────────

    private void seedLivreur004(LocalDate today) {
        final String livreurId = "livreur-004";
        if (tourneeJpaRepository.findByLivreurIdAndDate(livreurId, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", livreurId, today);
            return;
        }
        log.info("[DevDataSeeder] Creation de la tournee de test pour {} a {}...", livreurId, today);

        TourneeEntity tournee = new TourneeEntity("tournee-dev-004", livreurId, today, StatutTournee.CHARGEE);

        List<ColisEntity> colis = List.of(
                createColis("colis-dev-004-001", tournee, StatutColis.A_LIVRER,
                        "45 Cours Lafayette", null, "69003", "Lyon", "Zone E",
                        "Mme Simon", "0611223344",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Entre 9h00 et 12h00"))
                ),
                createColis("colis-dev-004-002", tournee, StatutColis.A_LIVRER,
                        "8 Rue Moncey", "Bat A", "69003", "Lyon", "Zone E",
                        "M. Laurent", "0622334455",
                        List.of()
                ),
                createColis("colis-dev-004-003", tournee, StatutColis.A_LIVRER,
                        "17 Boulevard des Brotteaux", null, "69006", "Lyon", "Zone F",
                        "Mme Mercier", "0633445566",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Objets precieux"))
                ),
                createColis("colis-dev-004-004", tournee, StatutColis.A_LIVRER,
                        "29 Rue Vendome", "2eme etage", "69006", "Lyon", "Zone F",
                        "M. Leblanc", "0644556677",
                        List.of()
                ),
                createColis("colis-dev-004-005", tournee, StatutColis.LIVRE,
                        "6 Place des Terreaux", null, "69001", "Lyon", "Zone G",
                        "Mme Garnier", "0655667788",
                        List.of()
                ),
                createColis("colis-dev-004-006", tournee, StatutColis.ECHEC,
                        "14 Rue Saint-Jean", null, "69005", "Lyon", "Zone G",
                        "M. Faure", "0666778899",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Avis recommande"))
                )
        );

        tournee.setColis(colis);
        tourneeJpaRepository.save(tournee);
        log.info("[DevDataSeeder] Tournee creee avec {} colis pour {}.", colis.size(), livreurId);
    }

    private ColisEntity createColis(
            String id,
            TourneeEntity tournee,
            StatutColis statut,
            String rue,
            String complement,
            String codePostal,
            String ville,
            String zone,
            String destinataireNom,
            String destinataireTel,
            List<ColisContrainteEmbeddable> contraintes
    ) {
        ColisEntity colis = new ColisEntity(
                id, tournee, statut,
                rue, complement, codePostal, ville, zone,
                destinataireNom, destinataireTel
        );
        colis.setContraintes(contraintes);
        return colis;
    }
}
