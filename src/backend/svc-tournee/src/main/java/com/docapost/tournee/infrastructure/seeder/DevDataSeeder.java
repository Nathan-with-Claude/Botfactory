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
 * Insere : 1 Tournee avec 5 Colis pour livreur-001 a la date du jour.
 * Ne re-insere pas si la tournee existe deja (idempotent au demarrage).
 *
 * TODO : supprimer quand US-024 (LancerTourneeHandler) est implemente.
 */
@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private static final String LIVREUR_ID = "livreur-001";

    private final TourneeJpaRepository tourneeJpaRepository;

    public DevDataSeeder(TourneeJpaRepository tourneeJpaRepository) {
        this.tourneeJpaRepository = tourneeJpaRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        LocalDate today = LocalDate.now();

        if (tourneeJpaRepository.findByLivreurIdAndDate(LIVREUR_ID, today).isPresent()) {
            log.info("[DevDataSeeder] Tournee deja presente pour {} a {} — skip.", LIVREUR_ID, today);
            return;
        }

        log.info("[DevDataSeeder] Creation de la tournee de test pour {} a {}...", LIVREUR_ID, today);

        TourneeEntity tournee = new TourneeEntity(
                "tournee-dev-001",
                LIVREUR_ID,
                today,
                StatutTournee.CHARGEE
        );

        List<ColisEntity> colis = List.of(
                createColis("colis-dev-001", tournee, StatutColis.A_LIVRER,
                        "12 Rue du Port", null, "69003", "Lyon", "Zone A",
                        "M. Dupont", "0601020304",
                        List.of(new ColisContrainteEmbeddable(TypeContrainte.HORAIRE, "Avant 14h00"))
                ),
                createColis("colis-dev-002", tournee, StatutColis.A_LIVRER,
                        "4 Allée des Roses", "Apt 12", "69006", "Lyon", "Zone B",
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

        log.info("[DevDataSeeder] Tournee creee avec {} colis pour {}.", colis.size(), LIVREUR_ID);
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
