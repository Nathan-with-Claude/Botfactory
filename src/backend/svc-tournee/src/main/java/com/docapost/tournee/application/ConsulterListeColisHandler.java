package com.docapost.tournee.application;

import com.docapost.tournee.domain.events.DomainEvent;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Application Service — Use case : Consulter la liste des colis d'une tournee (US-001).
 *
 * Responsabilite : orchestration uniquement. Pas de logique metier ici.
 * La logique metier (idempotence de demarrer, invariants) est dans l'Aggregate Root Tournee.
 *
 * Flux :
 * 1. Charge la Tournee via le Repository (port domain)
 * 2. Appelle tournee.demarrer() — idempotent, emet TourneeDemarree si premier acces
 * 3. Sauvegarde la Tournee (persist le nouveau statut DEMARREE)
 * 4. Publie les Domain Events collectes dans l'agregat
 * 5. Retourne la Tournee
 */
@Service
@Transactional
public class ConsulterListeColisHandler {

    private final TourneeRepository tourneeRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ConsulterListeColisHandler(
            TourneeRepository tourneeRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.tourneeRepository = tourneeRepository;
        this.eventPublisher = eventPublisher;
    }

    public Tournee handle(ConsulterListeColisCommand command) {
        // 1. Charger la Tournee
        Tournee tournee = tourneeRepository.findByLivreurIdAndDate(
                command.livreurId(),
                command.date()
        ).orElseThrow(() -> new TourneeNotFoundException(
                command.livreurId().value(),
                command.date()
        ));

        // 2. Demarrer la tournee (idempotent — emet TourneeDemarree uniquement au premier acces)
        tournee.demarrer();

        // 3. Sauvegarder (persist le statut DEMARREE si modifie)
        Tournee tourneeSauvegardee = tourneeRepository.save(tournee);

        // 4. Publier les Domain Events collectes
        List<DomainEvent> events = tournee.pullDomainEvents();
        events.forEach(eventPublisher::publishEvent);

        return tourneeSauvegardee;
    }
}
