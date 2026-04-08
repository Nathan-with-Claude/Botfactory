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

/**
 * DevDataSeeder — Initialise des données de test au démarrage (profils dev et recette).
 *
 * Tournées alignées avec svc-supervision BC-07 (TourneePlanifiee) :
 *   - livreur-002 (Paul Dupont)  : T-204  — LANCEE dans supervision
 *   - livreur-004 (Jean Moreau)  : T-202  — LANCEE dans supervision
 *
 * Les livreurs SANS_TOURNEE (livreur-001, livreur-003) n'ont pas de tournée ici
 * pour rester cohérents avec l'état affiché dans la supervision.
 *
 * Note : quand DevEventBridge (svc-supervision) propage TourneeLancee pour T-202 ou T-204,
 * DevTourneeController remplace la tournée seeder si elle existe déjà (idempotence).
 *
 * Source : US-011, US-033, US-049, US-066
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
        seedLivreur002(today);
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
        seedLivreur002(today);
        seedLivreur004(today);
        log.info("[DevDataSeeder] resetAndReseed — terminé");
    }

    // ─── livreur-002 : Paul Dupont — T-204 (22 colis, aligné BC-07) ─────────────

    private void seedLivreur002(LocalDate today) {
        final String livreurId = "livreur-002";
        if (tourneeJpaRepository.findByLivreurIdAndDate(livreurId, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", livreurId, today);
            return;
        }

        TourneeEntity tournee = new TourneeEntity("T-204", livreurId, today, StatutTournee.CHARGEE);

        List<ColisEntity> colis = List.of(
                createColis("T-204-C-001", tournee, StatutColis.A_LIVRER,
                        "1 Rue de la Republique", null, "69002", "Lyon", "Lyon 2e",
                        "M. Arnaud", "0600000001",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 10h00"))),
                createColis("T-204-C-002", tournee, StatutColis.A_LIVRER,
                        "2 Rue de la Republique", "Apt 2", "69002", "Lyon", "Lyon 2e",
                        "Mme Blanchard", "0600000002", List.of()),
                createColis("T-204-C-003", tournee, StatutColis.A_LIVRER,
                        "3 Quai des Celestins", null, "69002", "Lyon", "Lyon 2e",
                        "M. Collet", "0600000003",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Verre"))),
                createColis("T-204-C-004", tournee, StatutColis.A_LIVRER,
                        "4 Rue Merciere", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Denis", "0600000004", List.of()),
                createColis("T-204-C-005", tournee, StatutColis.A_LIVRER,
                        "5 Place Bellecour", "Bat A", "69002", "Lyon", "Lyon 2e",
                        "M. Esposito", "0600000005", List.of()),
                createColis("T-204-C-006", tournee, StatutColis.A_LIVRER,
                        "6 Rue Saint-Nizier", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Faure", "0600000006",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Contrat"))),
                createColis("T-204-C-007", tournee, StatutColis.A_LIVRER,
                        "7 Rue de Brest", "3eme etage", "69002", "Lyon", "Lyon 2e",
                        "M. Garcia", "0600000007", List.of()),
                createColis("T-204-C-008", tournee, StatutColis.A_LIVRER,
                        "8 Rue Grenette", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Henry", "0600000008", List.of()),
                createColis("T-204-C-009", tournee, StatutColis.A_LIVRER,
                        "9 Place des Jacobins", null, "69002", "Lyon", "Lyon 2e",
                        "M. Jacquot", "0600000009",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Apres 11h00"))),
                createColis("T-204-C-010", tournee, StatutColis.A_LIVRER,
                        "10 Rue Auguste Comte", "Bat B", "69002", "Lyon", "Lyon 2e",
                        "Mme Klein", "0600000010", List.of()),
                createColis("T-204-C-011", tournee, StatutColis.A_LIVRER,
                        "11 Rue Victor Hugo", null, "69002", "Lyon", "Lyon 2e",
                        "M. Leclerc", "0600000011", List.of()),
                createColis("T-204-C-012", tournee, StatutColis.A_LIVRER,
                        "12 Rue de Conde", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Martin", "0600000012",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Objets precieux"))),
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
                        "Mme Renard", "0600000016",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 12h00"))),
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
                        "M. Wagner", "0600000021",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Avis recommande"))),
                createColis("T-204-C-022", tournee, StatutColis.A_LIVRER,
                        "22 Rue du Colonel Chambonnet", null, "69002", "Lyon", "Lyon 2e",
                        "Mme Xavier", "0600000022", List.of())
        );

        tournee.setColis(colis);
        tourneeJpaRepository.save(tournee);
        log.info("[DevDataSeeder] Tournee T-204 creee avec {} colis pour {}.", colis.size(), livreurId);
    }

    // ─── livreur-004 : Jean Moreau — T-202 (28 colis, aligné BC-07) ─────────────

    private void seedLivreur004(LocalDate today) {
        final String livreurId = "livreur-004";
        if (tourneeJpaRepository.findByLivreurIdAndDate(livreurId, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", livreurId, today);
            return;
        }

        TourneeEntity tournee = new TourneeEntity("T-202", livreurId, today, StatutTournee.CHARGEE);

        List<ColisEntity> colis = List.of(
                createColis("T-202-C-001", tournee, StatutColis.A_LIVRER,
                        "1 Rue de la Paix", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Aubert", "0600010001",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Entre 9h00 et 12h00"))),
                createColis("T-202-C-002", tournee, StatutColis.A_LIVRER,
                        "2 Avenue Henri Barbusse", "Bat A", "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Bertrand", "0600010002", List.of()),
                createColis("T-202-C-003", tournee, StatutColis.A_LIVRER,
                        "3 Cours Emile Zola", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Carpentier", "0600010003",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Objets precieux"))),
                createColis("T-202-C-004", tournee, StatutColis.A_LIVRER,
                        "4 Rue Francis de Pressense", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme David", "0600010004", List.of()),
                createColis("T-202-C-005", tournee, StatutColis.ECHEC,
                        "14 Rue Saint-Jean", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Evrard", "0600010005",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Avis recommande"))),
                createColis("T-202-C-006", tournee, StatutColis.A_LIVRER,
                        "6 Rue du 4 Aout", "2eme etage", "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Fontaine", "0600010006", List.of()),
                createColis("T-202-C-007", tournee, StatutColis.A_LIVRER,
                        "7 Avenue Roger Salengro", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Guerin", "0600010007", List.of()),
                createColis("T-202-C-008", tournee, StatutColis.A_LIVRER,
                        "8 Rue Anatole France", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Hubert", "0600010008",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 11h00"))),
                createColis("T-202-C-009", tournee, StatutColis.A_LIVRER,
                        "9 Rue Paul Verlaine", "Bat B", "69100", "Villeurbanne", "Villeurbanne",
                        "M. Imbert", "0600010009", List.of()),
                createColis("T-202-C-010", tournee, StatutColis.A_LIVRER,
                        "10 Avenue Joannes Masset", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Julien", "0600010010", List.of()),
                createColis("T-202-C-011", tournee, StatutColis.A_LIVRER,
                        "11 Rue Bouvier", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Klein", "0600010011", List.of()),
                createColis("T-202-C-012", tournee, StatutColis.A_LIVRER,
                        "12 Rue du Belier", "Apt 3", "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Lacombe", "0600010012",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.FRAGILE, "Electronique"))),
                createColis("T-202-C-013", tournee, StatutColis.A_LIVRER,
                        "13 Avenue Louis Braille", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Mallet", "0600010013", List.of()),
                createColis("T-202-C-014", tournee, StatutColis.A_LIVRER,
                        "14 Rue Michel Servet", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Noel", "0600010014", List.of()),
                createColis("T-202-C-015", tournee, StatutColis.A_LIVRER,
                        "15 Rue du General Leclerc", "Bat C", "69100", "Villeurbanne", "Villeurbanne",
                        "M. Olivier", "0600010015",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 12h00"))),
                createColis("T-202-C-016", tournee, StatutColis.A_LIVRER,
                        "16 Rue Jules Ferry", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Perez", "0600010016", List.of()),
                createColis("T-202-C-017", tournee, StatutColis.A_LIVRER,
                        "17 Rue Racine", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Renaud", "0600010017", List.of()),
                createColis("T-202-C-018", tournee, StatutColis.A_LIVRER,
                        "18 Avenue du 8 Mai 1945", "Apt 7", "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Schmitt", "0600010018", List.of()),
                createColis("T-202-C-019", tournee, StatutColis.A_LIVRER,
                        "19 Rue Pierret", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Turpin", "0600010019", List.of()),
                createColis("T-202-C-020", tournee, StatutColis.A_LIVRER,
                        "20 Rue des Iris", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Vasseur", "0600010020",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.DOCUMENT_SENSIBLE, "Contrat"))),
                createColis("T-202-C-021", tournee, StatutColis.A_LIVRER,
                        "21 Rue de la Tete d Or", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Weber", "0600010021", List.of()),
                createColis("T-202-C-022", tournee, StatutColis.A_LIVRER,
                        "22 Rue Pierre Semard", "Bat D", "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Xavier", "0600010022", List.of()),
                createColis("T-202-C-023", tournee, StatutColis.A_LIVRER,
                        "23 Rue Arago", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Ybert", "0600010023", List.of()),
                createColis("T-202-C-024", tournee, StatutColis.A_LIVRER,
                        "24 Avenue Croix Luizet", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Zimmermann", "0600010024",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Apres 10h00"))),
                createColis("T-202-C-025", tournee, StatutColis.A_LIVRER,
                        "25 Rue des Charmilles", "Apt 1", "69100", "Villeurbanne", "Villeurbanne",
                        "M. Andre", "0600010025", List.of()),
                createColis("T-202-C-026", tournee, StatutColis.A_LIVRER,
                        "26 Rue Edouard Herriot", null, "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Bonnet", "0600010026", List.of()),
                createColis("T-202-C-027", tournee, StatutColis.A_LIVRER,
                        "27 Rue de la Liberation", null, "69100", "Villeurbanne", "Villeurbanne",
                        "M. Clement", "0600010027", List.of()),
                createColis("T-202-C-028", tournee, StatutColis.A_LIVRER,
                        "28 Avenue du Sart", "Bat E", "69100", "Villeurbanne", "Villeurbanne",
                        "Mme Dupuis", "0600010028", List.of())
        );

        tournee.setColis(colis);
        tourneeJpaRepository.save(tournee);
        log.info("[DevDataSeeder] Tournee T-202 creee avec {} colis pour {}.", colis.size(), livreurId);
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
