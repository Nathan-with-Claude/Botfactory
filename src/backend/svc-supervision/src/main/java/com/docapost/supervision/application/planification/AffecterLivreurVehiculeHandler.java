package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * AffecterLivreurVehiculeHandler — Application Service BC-07 (US-023)
 *
 * Orchestre l'affectation d'un livreur et d'un véhicule à une tournée planifiée.
 * Vérifie les invariants d'unicité (1 livreur/tournée/jour, 1 véhicule/tournée/jour)
 * AVANT de déléguer à l'Aggregate.
 *
 * Source : US-023
 */
@Service
public class AffecterLivreurVehiculeHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public AffecterLivreurVehiculeHandler(TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
    }

    public void handle(AffecterLivreurVehiculeCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // Vérification des invariants d'unicité au niveau repository (avant délégation au domaine)
        if (tourneePlanifieeRepository.isLivreurDejaAffecte(command.livreurId(), tournee.getDate())) {
            // Permettre la réaffectation du même livreur sur la même tournée (mise à jour)
            if (!command.livreurId().equals(tournee.getLivreurId())) {
                throw new LivreurDejaAffecteException(command.livreurId());
            }
        }
        if (tourneePlanifieeRepository.isVehiculeDejaAffecte(command.vehiculeId(), tournee.getDate())) {
            if (!command.vehiculeId().equals(tournee.getVehiculeId())) {
                throw new VehiculeDejaAffecteException(command.vehiculeId());
            }
        }

        // Le domaine décide — pas de logique métier dans l'Application Layer
        tournee.affecter(command.livreurId(), command.livreurNom(), command.vehiculeId(), command.superviseurId());

        tourneePlanifieeRepository.save(tournee);
        tournee.clearEvenements();
    }
}
