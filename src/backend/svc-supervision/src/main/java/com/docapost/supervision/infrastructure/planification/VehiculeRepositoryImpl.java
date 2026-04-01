package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.model.Vehicule;
import com.docapost.supervision.domain.planification.model.VehiculeId;
import com.docapost.supervision.domain.planification.model.TypeVehicule;
import com.docapost.supervision.domain.planification.repository.VehiculeRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * VehiculeRepositoryImpl — Implémentation Infrastructure BC-07 (US-030)
 *
 * MVP : données en mémoire (référentiel statique des véhicules de la flotte).
 * En production, cette implémentation sera remplacée par une persistance JPA.
 *
 * Le référentiel est initialisé avec la flotte DocuPost par défaut.
 *
 * Source : US-030
 */
@Repository
public class VehiculeRepositoryImpl implements VehiculeRepository {

    private final Map<String, Vehicule> store = new ConcurrentHashMap<>();

    public VehiculeRepositoryImpl() {
        // Flotte DocuPost par défaut (données de développement)
        List<Vehicule> flotte = List.of(
                new Vehicule(new VehiculeId("VH-01"), "VH-01", 800, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-02"), "VH-02", 600, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-03"), "VH-03", 500, TypeVehicule.UTILITAIRE_LEGER),
                new Vehicule(new VehiculeId("VH-04"), "VH-04", 700, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-05"), "VH-05", 450, TypeVehicule.UTILITAIRE_LEGER),
                new Vehicule(new VehiculeId("VH-06"), "VH-06", 300, TypeVehicule.UTILITAIRE_LEGER),
                new Vehicule(new VehiculeId("VH-07"), "VH-07", 600, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-08"), "VH-08", 500, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-09"), "VH-09", 150, TypeVehicule.CARGO_VELO),
                new Vehicule(new VehiculeId("VH-10"), "VH-10", 800, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-11"), "VH-11", 700, TypeVehicule.FOURGON)
        );
        flotte.forEach(v -> store.put(v.getVehiculeId().getValeur(), v));
    }

    @Override
    public Optional<Vehicule> findById(VehiculeId vehiculeId) {
        return Optional.ofNullable(store.get(vehiculeId.getValeur()));
    }

    @Override
    public List<Vehicule> findDisponibles(LocalDate date) {
        // MVP : tous les véhicules sont disponibles (filtre effectif déféré à une impl JPA)
        return List.copyOf(store.values());
    }

    @Override
    public void save(Vehicule vehicule) {
        store.put(vehicule.getVehiculeId().getValeur(), vehicule);
    }
}
