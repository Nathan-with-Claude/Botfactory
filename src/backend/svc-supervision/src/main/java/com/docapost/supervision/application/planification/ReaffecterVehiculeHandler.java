package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.domain.planification.repository.VehiculeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/**
 * ReaffecterVehiculeHandler — Application Service BC-07 (US-034)
 *
 * Orchestre la réaffectation d'une tournée vers un véhicule de plus grande capacité
 * après un échec de compatibilité (CompatibiliteVehiculeEchouee — US-030).
 *
 * Flux principal (handle) :
 * 1. Charger la TourneePlanifiee
 * 2. Charger le nouveau Vehicule
 * 3. Déléguer la vérification de compatibilité à l'Aggregate (logique dans le domaine)
 * 4. Si compatible → sauvegarder (CompatibiliteVehiculeVerifiee est émis par l'Aggregate)
 * 5. Retourner un CompatibiliteVehiculeResultatDTO
 *
 * Flux de recherche (rechercherVehiculesCompatibles) :
 * - Retourne tous les véhicules disponibles dont la capacité >= poidsMinKg
 *
 * Source : US-034
 */
@Service
public class ReaffecterVehiculeHandler {

    private final TourneePlanifieeRepository tourneePlanifieeRepository;
    private final VehiculeRepository vehiculeRepository;

    public ReaffecterVehiculeHandler(
            TourneePlanifieeRepository tourneePlanifieeRepository,
            VehiculeRepository vehiculeRepository
    ) {
        this.tourneePlanifieeRepository = Objects.requireNonNull(tourneePlanifieeRepository);
        this.vehiculeRepository = Objects.requireNonNull(vehiculeRepository);
    }

    /**
     * Réaffecte la tournée vers un nouveau véhicule et vérifie la compatibilité.
     *
     * @param command contient tourneePlanifieeId, nouveauVehiculeId, superviseurId
     * @return CompatibiliteVehiculeResultatDTO avec résultat COMPATIBLE ou exception si dépassement
     * @throws TourneePlanifieeNotFoundException si la tournée n'existe pas
     * @throws VehiculeNotFoundException si le véhicule n'existe pas
     * @throws CapaciteVehiculeDepasseeException si le nouveau véhicule est encore insuffisant
     */
    public CompatibiliteVehiculeResultatDTO handle(ReaffecterVehiculeCommand command) {
        Objects.requireNonNull(command, "La commande ne peut pas être null");

        // 1. Charger la TourneePlanifiee
        TourneePlanifiee tournee = tourneePlanifieeRepository.findById(command.tourneePlanifieeId())
                .orElseThrow(() -> new TourneePlanifieeNotFoundException(command.tourneePlanifieeId()));

        // 2. Charger le nouveau Vehicule
        Vehicule vehicule = vehiculeRepository.findById(new VehiculeId(command.nouveauVehiculeId()))
                .orElseThrow(() -> new VehiculeNotFoundException(command.nouveauVehiculeId()));

        // 3. Évaluer sans side-effect
        ResultatCompatibilite resultat = tournee.evaluerCompatibiliteVehicule(vehicule);

        // 4. Cas POIDS_ABSENT : retour immédiat sans sauvegarde
        if (resultat == ResultatCompatibilite.POIDS_ABSENT) {
            return CompatibiliteVehiculeResultatDTO.poidsAbsent(
                    command.nouveauVehiculeId(), vehicule.getCapaciteKg()
            );
        }

        // 5. Cas DEPASSEMENT : le nouveau véhicule est encore insuffisant
        if (resultat == ResultatCompatibilite.DEPASSEMENT) {
            throw new CapaciteVehiculeDepasseeException(
                    command.nouveauVehiculeId(),
                    vehicule.getCapaciteKg(),
                    tournee.getPoidsEstimeKg()
            );
        }

        // 6. Cas COMPATIBLE : émettre l'event et sauvegarder
        tournee.verifierCompatibiliteVehicule(vehicule, command.superviseurId());
        tourneePlanifieeRepository.save(tournee);
        tournee.clearEvenements();

        return CompatibiliteVehiculeResultatDTO.compatible(
                command.nouveauVehiculeId(),
                tournee.getPoidsEstimeKg(),
                vehicule.getCapaciteKg()
        );
    }

    /**
     * Retourne la liste des véhicules disponibles dont la capacité est >= poidsMinKg.
     * Utilisé par le panneau de sélection (US-034 SC2) pour pré-filtrer la liste.
     *
     * @param poidsMinKg poids minimum requis en kg
     * @param date date de la tournée (pour filtrer les véhicules disponibles)
     * @return liste de véhicules triés par capacité croissante
     */
    public List<Vehicule> rechercherVehiculesCompatibles(int poidsMinKg, LocalDate date) {
        return vehiculeRepository.findDisponibles(date).stream()
                .filter(v -> v.peutPorter(poidsMinKg))
                .sorted(java.util.Comparator.comparingInt(Vehicule::getCapaciteKg))
                .toList();
    }
}
