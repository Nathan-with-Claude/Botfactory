package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.repository.VehiculeRepository;
import com.docapost.supervision.interfaces.planification.dto.VehiculeCompatibleDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/**
 * ConsulterVehiculesCompatiblesHandler — Application Service BC-07 (US-034)
 *
 * Retourne la liste des véhicules disponibles dont la capacité est >= poidsMinKg.
 * Utilisé après un événement CompatibiliteVehiculeEchouee pour proposer une réaffectation.
 *
 * Flux :
 * 1. Récupérer tous les véhicules disponibles pour aujourd'hui
 * 2. Filtrer ceux dont capaciteKg >= poidsMinKg
 * 3. Construire les DTOs avec la marge calculée
 * 4. Trier par capacité croissante (le plus petit véhicule compatible en premier)
 *
 * Source : US-034
 */
@Service
public class ConsulterVehiculesCompatiblesHandler {

    private final VehiculeRepository vehiculeRepository;

    public ConsulterVehiculesCompatiblesHandler(VehiculeRepository vehiculeRepository) {
        this.vehiculeRepository = Objects.requireNonNull(vehiculeRepository);
    }

    public List<VehiculeCompatibleDTO> handle(ConsulterVehiculesCompatiblesQuery query) {
        Objects.requireNonNull(query, "La query ne peut pas être null");

        return vehiculeRepository
                .findDisponibles(LocalDate.now())
                .stream()
                .filter(v -> v.getCapaciteKg() >= query.poidsMinKg())
                .sorted((v1, v2) -> Integer.compare(v1.getCapaciteKg(), v2.getCapaciteKg()))
                .map(v -> VehiculeCompatibleDTO.from(v, query.poidsMinKg()))
                .toList();
    }
}
