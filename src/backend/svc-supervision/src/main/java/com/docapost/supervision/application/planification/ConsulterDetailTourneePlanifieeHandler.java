package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * ConsulterDetailTourneePlanifieeHandler — Application Service BC-07 (US-022)
 *
 * Retourne le détail complet d'une tournée planifiée (composition, anomalies, contraintes).
 * Opération de lecture pure — ne modifie pas l'Aggregate.
 *
 * Source : US-022
 */
@Service
public class ConsulterDetailTourneePlanifieeHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public ConsulterDetailTourneePlanifieeHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    public TourneePlanifiee handle(ConsulterDetailTourneePlanifieeQuery query) {
        Objects.requireNonNull(query, "La query ne peut pas être null");
        return tourneePlanifieeRepository.findById(query.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(query.tourneePlanifieeId()));
    }
}
