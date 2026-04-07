package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * DesaffecterTourneeHandler — Application Service BC-07 (US-050)
 *
 * Orchestre la désaffectation d'un livreur depuis une tournée planifiée.
 * Délègue l'invariant (AFFECTEE requis, LANCEE interdit) à l'Aggregate.
 *
 * Source : US-050
 */
@Service
public class DesaffecterTourneeHandler {

    private static final Logger log = LoggerFactory.getLogger(DesaffecterTourneeHandler.class);

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public DesaffecterTourneeHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    public TourneePlanifiee handle(DesaffecterTourneeCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // Le domaine applique l'invariant (AFFECTEE requis, LANCEE interdit)
        tournee.desaffecter(command.superviseurId());

        tourneePlanifieeRepository.save(tournee);

        log.info("[BC-07] DesaffectationEnregistree : tourneePlanifieeId={}, superviseurId={}",
                command.tourneePlanifieeId(), command.superviseurId());

        tournee.clearEvenements();
        return tournee;
    }
}
