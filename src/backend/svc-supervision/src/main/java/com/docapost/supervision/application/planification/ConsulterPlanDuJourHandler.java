package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * ConsulterPlanDuJourHandler — Application Service BC-07 (US-021)
 *
 * Orchestre la récupération du plan du jour :
 * - Sans filtre : toutes les tournées de la date
 * - Avec filtre : uniquement les tournées du statut demandé
 *
 * Pas de logique métier ici : le domaine décide.
 *
 * Source : US-021
 */
@Service
public class ConsulterPlanDuJourHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public ConsulterPlanDuJourHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    public List<TourneePlanifiee> handle(ConsulterPlanDuJourQuery query) {
        Objects.requireNonNull(query, "La query ne peut pas être null");

        if (query.filtre() != null) {
            return tourneePlanifieeRepository.findByDateAndStatut(query.date(), query.filtre());
        }
        return tourneePlanifieeRepository.findByDate(query.date());
    }
}
