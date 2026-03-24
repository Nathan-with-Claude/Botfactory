package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * LancerTourneeHandler — Application Service BC-07 (US-024)
 *
 * Orchestre le lancement d'une tournée affectée.
 * Après sauvegarde, collecte l'événement TourneeLancee.
 *
 * Dans le MVP : l'événement TourneeLancee est loggué (simulation bus d'événements).
 * En production : publier sur Kafka → svc-tournee consomme et crée la tournée mobile.
 *
 * Source : US-024
 */
@Service
public class LancerTourneeHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public LancerTourneeHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    /**
     * Lance une tournée individuelle.
     *
     * @return L'événement TourneeLancee émis (pour simulation de synchronisation BC-01 dans le MVP)
     */
    public TourneeLancee handle(LancerTourneeCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // Le domaine décide et émet l'événement
        tournee.lancer(command.superviseurId());

        tourneePlanifieeRepository.save(tournee);

        // Collect-and-publish : extraire l'événement avant clearEvenements
        List<Object> evenements = tournee.getEvenements();
        TourneeLancee tourneeLancee = evenements.stream()
                .filter(e -> e instanceof TourneeLancee)
                .map(e -> (TourneeLancee) e)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("TourneeLancee introuvable après lancer()"));

        tournee.clearEvenements();
        return tourneeLancee;
    }

    /**
     * US-024 SC3 : Lancement groupé de toutes les tournées affectées d'une date.
     *
     * @return Nombre de tournées lancées
     */
    public int lancerToutesLesTourneesAffectees(String superviseurId) {
        Objects.requireNonNull(superviseurId, "Le superviseurId est obligatoire");

        List<TourneePlanifiee> affectees = tourneePlanifieeRepository.findByDateAndStatut(
                java.time.LocalDate.now(),
                com.docapost.supervision.domain.planification.model.StatutAffectation.AFFECTEE
        );

        int lancees = 0;
        for (TourneePlanifiee tournee : affectees) {
            tournee.lancer(superviseurId);
            tourneePlanifieeRepository.save(tournee);
            tournee.clearEvenements();
            lancees++;
        }
        return lancees;
    }
}
