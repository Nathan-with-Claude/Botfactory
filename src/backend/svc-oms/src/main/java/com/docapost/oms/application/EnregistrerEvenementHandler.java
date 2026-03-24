package com.docapost.oms.application;

import com.docapost.oms.domain.model.Coordonnees;
import com.docapost.oms.domain.model.EvenementLivraison;
import com.docapost.oms.domain.model.StatutSynchronisation;
import com.docapost.oms.domain.repository.EvenementStore;
import org.springframework.stereotype.Service;

/**
 * Handler US-018 — Enregistrer un événement de livraison dans l'Event Store.
 *
 * Invariants garantis :
 * - Idempotence : si l'eventId existe déjà, lance EvenementDejaExistantException (HTTP 409).
 * - Mode dégradé GPS : coordonnées null acceptées si latitude/longitude sont null dans la commande.
 * - L'événement est créé avec StatutSynchronisation.PENDING pour être pris en charge par l'Outbox.
 */
@Service
public class EnregistrerEvenementHandler {

    private final EvenementStore evenementStore;

    public EnregistrerEvenementHandler(EvenementStore evenementStore) {
        this.evenementStore = evenementStore;
    }

    public void handle(EnregistrerEvenementCommand cmd) {
        // Idempotence : rejeter les doublons
        if (evenementStore.findById(cmd.eventId()).isPresent()) {
            throw new EvenementDejaExistantException(cmd.eventId());
        }

        // Coordonnées GPS — mode dégradé si absentes
        boolean modeDegradGPS = (cmd.latitude() == null || cmd.longitude() == null);
        Coordonnees coordonnees = modeDegradGPS
                ? null
                : new Coordonnees(cmd.latitude(), cmd.longitude());

        EvenementLivraison evenement = new EvenementLivraison(
                cmd.eventId(),
                cmd.tourneeId(),
                cmd.colisId(),
                cmd.livreurId(),
                cmd.type(),
                cmd.horodatage(),
                coordonnees,
                modeDegradGPS,
                cmd.preuveLivraisonId(),
                cmd.motifEchec(),
                StatutSynchronisation.PENDING,
                0
        );

        evenementStore.append(evenement);
    }
}
