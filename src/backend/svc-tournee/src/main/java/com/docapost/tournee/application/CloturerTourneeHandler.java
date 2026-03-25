package com.docapost.tournee.application;

import com.docapost.tournee.domain.events.DomainEvent;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — CloturerTourneeHandler
 *
 * Orchestre la cloture d'une tournee :
 * 1. Charge la tournee depuis le repository.
 * 2. Appelle Tournee.cloturerTournee() (verif invariants + emission TourneeCloturee).
 * 3. Sauvegarde la tournee avec statut CLOTUREE.
 * 4. Publie les Domain Events via l'eventPublisher.
 * 5. Retourne le RecapitulatifTournee.
 *
 * Source : US-007 — Cloture de tournee.
 */
@Service
public class CloturerTourneeHandler {

    private final TourneeRepository tourneeRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CloturerTourneeHandler(
            TourneeRepository tourneeRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.tourneeRepository = tourneeRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Traite la commande de cloture d'une tournee.
     *
     * @param command commande contenant l'identifiant de la tournee
     * @return RecapitulatifTourneeResult avec les compteurs de livraison
     * @throws TourneeNotFoundException     si la tournee n'existe pas
     * @throws com.docapost.tournee.domain.model.TourneeInvariantException
     *                                      si des colis sont encore en statut A_LIVRER
     */
    public RecapitulatifTourneeResult handle(CloturerTourneeCommand command) {
        // 1. Charger la tournee
        Tournee tournee = tourneeRepository.findById(command.tourneeId())
                .orElseThrow(() -> new TourneeNotFoundException(
                        command.tourneeId().value(), null
                ));

        // 2. Appeler la methode domaine (verifie les invariants, emet TourneeCloturee)
        com.docapost.tournee.domain.model.RecapitulatifTournee recapDomain = tournee.cloturerTournee();

        // 3. Sauvegarder la tournee avec le nouveau statut CLOTUREE
        tourneeRepository.save(tournee);

        // 4. Publier les Domain Events (pattern collect-and-publish)
        List<DomainEvent> events = tournee.pullDomainEvents();
        events.forEach(eventPublisher::publishEvent);

        // 5. Retourner le DTO de recap
        return RecapitulatifTourneeResult.from(tournee, recapDomain);
    }
}
