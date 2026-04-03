package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.domain.planification.repository.VehiculeRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

/**
 * VerifierCompatibiliteVehiculeHandler — Application Service BC-07 (US-030)
 *
 * Orchestre la vérification de compatibilité entre un véhicule et la charge d'une tournée.
 *
 * Flux :
 * 1. Récupérer la TourneePlanifiee
 * 2. Récupérer le Vehicule
 * 3. Déléguer l'évaluation à l'Aggregate (logique métier dans le domaine)
 * 4. En cas de dépassement avec forcerSiDepassement=true : appeler forcerAffectationMalgreDepassement()
 * 5. Sauvegarder si des events ont été émis
 * 6. Retourner un CompatibiliteVehiculeResultatDTO
 *
 * Source : US-030
 */
@Service
public class VerifierCompatibiliteVehiculeHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;
    private final VehiculeRepository vehiculeRepository;

    public VerifierCompatibiliteVehiculeHandler(
            TourneePlanifieeRepository tourneePlanifieeRepository,
            VehiculeRepository vehiculeRepository
    ) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
        this.vehiculeRepository = Objects.requireNonNull(vehiculeRepository);
    }

    public CompatibiliteVehiculeResultatDTO handle(VerifierCompatibiliteVehiculeCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        // 1. Récupérer la TourneePlanifiee
        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // 2. Récupérer le Vehicule
        Vehicule vehicule = vehiculeRepository.findById(new VehiculeId(command.vehiculeId()))
                .orElseThrow(() -> new VehiculeNotFoundException(command.vehiculeId()));

        // 3. Évaluer sans side-effect
        ResultatCompatibilite resultat = tournee.evaluerCompatibiliteVehicule(vehicule);

        // 4. Cas POIDS_ABSENT : retour immédiat sans sauvegarde
        if (resultat == ResultatCompatibilite.POIDS_ABSENT) {
            return CompatibiliteVehiculeResultatDTO.poidsAbsent(
                    command.vehiculeId(), vehicule.getCapaciteKg()
            );
        }

        // 5. Cas DEPASSEMENT
        if (resultat == ResultatCompatibilite.DEPASSEMENT) {
            if (command.forcerSiDepassement()) {
                // Le logisticien force l'affectation malgré le dépassement (SC3)
                tournee.forcerAffectationMalgreDepassement(vehicule, command.superviseurId());
                tourneePlanifieeRepository.save(tournee);
                tournee.clearEvenements();
                return CompatibiliteVehiculeResultatDTO.depassement(
                        command.vehiculeId(),
                        tournee.getPoidsEstimeKg(),
                        vehicule.getCapaciteKg()
                );
            } else {
                // SC2 : dépassement non autorisé → lever exception (pas de sauvegarde)
                throw new CapaciteVehiculeDepasseeException(
                        command.vehiculeId(),
                        vehicule.getCapaciteKg(),
                        tournee.getPoidsEstimeKg()
                );
            }
        }

        // 6. Cas COMPATIBLE : émettre l'event et sauvegarder (SC1)
        tournee.verifierCompatibiliteVehicule(vehicule, command.superviseurId());
        tourneePlanifieeRepository.save(tournee);
        tournee.clearEvenements();

        return CompatibiliteVehiculeResultatDTO.compatible(
                command.vehiculeId(),
                tournee.getPoidsEstimeKg(),
                vehicule.getCapaciteKg()
        );
    }
}
