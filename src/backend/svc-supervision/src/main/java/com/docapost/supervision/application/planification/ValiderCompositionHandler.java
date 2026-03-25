package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * ValiderCompositionHandler — Application Service BC-07 (US-022)
 *
 * Orchestre la validation explicite de la composition d'une tournée.
 * Délègue la logique à l'Aggregate TourneePlanifiee.
 * Publie les événements après sauvegarde (collect-and-publish).
 *
 * Source : US-022
 */
@Service
public class ValiderCompositionHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public ValiderCompositionHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    public void handle(ValiderCompositionCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // Le domaine décide — pas de logique dans l'Application Layer
        tournee.verifierComposition(command.superviseurId());

        // Sauvegarde + collect-and-publish (dans le MVP : persist uniquement, pas de bus)
        tourneePlanifieeRepository.save(tournee);
        tournee.clearEvenements();
    }
}
