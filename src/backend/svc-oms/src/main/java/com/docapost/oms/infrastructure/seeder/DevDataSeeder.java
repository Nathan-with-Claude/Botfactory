package com.docapost.oms.infrastructure.seeder;

import com.docapost.oms.domain.model.StatutSynchronisation;
import com.docapost.oms.domain.model.TypeEvenement;
import com.docapost.oms.infrastructure.persistence.EvenementEntity;
import com.docapost.oms.infrastructure.persistence.EvenementJpaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * DevDataSeeder — Données de test pour le profil dev (US-017 + US-018).
 *
 * Crée 4 événements pour la tournée tournee-sup-001 :
 * - TourneeDemarree (SYNCHRONIZED — déjà transmis)
 * - LivraisonConfirmee colis-s-001 (SYNCHRONIZED)
 * - EchecLivraisonDeclare colis-s-002 (SYNCHRONIZED, mode dégradé GPS)
 * - LivraisonConfirmee colis-s-003 (PENDING — en attente de sync)
 *
 * Ces données permettent de tester l'audit historique (US-018) et le rejeu outbox (US-017).
 */
@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private final EvenementJpaRepository jpaRepository;

    public DevDataSeeder(EvenementJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void run(String... args) {
        Instant base = Instant.now().minusSeconds(7200);

        // Événement 1 : TourneeDemarree — SYNCHRONIZED
        jpaRepository.save(new EvenementEntity(
                "evt-001", "tournee-sup-001", null, "livreur-pierre-001",
                TypeEvenement.TOURNEE_DEMARREE, base,
                48.8566, 2.3522, false,
                null, null,
                StatutSynchronisation.SYNCHRONIZED, 1
        ));

        // Événement 2 : LivraisonConfirmee colis-s-001 — SYNCHRONIZED
        jpaRepository.save(new EvenementEntity(
                "evt-002", "tournee-sup-001", "colis-s-001", "livreur-pierre-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, base.plusSeconds(1800),
                48.8698, 2.3310, false,
                "preuve-sig-001", null,
                StatutSynchronisation.SYNCHRONIZED, 1
        ));

        // Événement 3 : EchecLivraisonDeclare colis-s-002 — SYNCHRONIZED, mode dégradé GPS
        jpaRepository.save(new EvenementEntity(
                "evt-003", "tournee-sup-001", "colis-s-002", "livreur-pierre-001",
                TypeEvenement.ECHEC_LIVRAISON_DECLARE, base.plusSeconds(3000),
                null, null, true,
                null, "ABSENT",
                StatutSynchronisation.SYNCHRONIZED, 2
        ));

        // Événement 4 : LivraisonConfirmee colis-s-003 — PENDING (en attente de sync OMS)
        jpaRepository.save(new EvenementEntity(
                "evt-004", "tournee-sup-001", "colis-s-003", "livreur-pierre-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, base.plusSeconds(4500),
                48.8742, 2.3198, false,
                "preuve-photo-001", null,
                StatutSynchronisation.PENDING, 0
        ));
    }
}
