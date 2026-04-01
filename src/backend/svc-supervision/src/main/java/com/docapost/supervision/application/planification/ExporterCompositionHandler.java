package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * ExporterCompositionHandler — Application Service BC-07 (US-028)
 *
 * Orchestre la traçabilité d'un export CSV de la composition d'une tournée.
 * Délègue à l'Aggregate TourneePlanifiee qui émet CompositionExportee.
 * Publie les événements après sauvegarde (collect-and-publish).
 *
 * Invariant respecté : aucune modification d'état de la TourneePlanifiee.
 *
 * Source : US-028
 */
@Service
public class ExporterCompositionHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public ExporterCompositionHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    public void handle(ExporterCompositionCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // Le domaine trace l'export — pas de logique dans l'Application Layer
        tournee.tracerExportComposition(command.superviseurId());

        // Sauvegarde + collect-and-publish (dans le MVP : persist uniquement, pas de bus)
        tourneePlanifieeRepository.save(tournee);
        tournee.clearEvenements();
    }
}
