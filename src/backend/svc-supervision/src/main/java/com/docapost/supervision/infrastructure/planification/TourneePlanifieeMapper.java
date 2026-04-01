package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

/**
 * TourneePlanifieeMapper — Traduction Entity ↔ Aggregate BC-07
 *
 * Sérialise zones, contraintes et anomalies en JSON pour la persistance.
 *
 * Source : US-021 à US-024
 */
public class TourneePlanifieeMapper {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private TourneePlanifieeMapper() {}

    public static TourneePlanifiee toDomain(TourneePlanifieeEntity entity) {
        List<ZoneTournee> zones = parseZones(entity.getZonesJson());
        List<ContrainteHoraire> contraintes = parseContraintes(entity.getContraintesJson());
        List<Anomalie> anomalies = parseAnomalies(entity.getAnomaliesJson());

        return new TourneePlanifiee(
                entity.getId(),
                entity.getCodeTms(),
                entity.getDate(),
                entity.getNbColis(),
                zones,
                contraintes,
                anomalies,
                entity.getImporteeLe(),
                entity.getStatut(),
                entity.getLivreurId(),
                entity.getLivreurNom(),
                entity.getVehiculeId(),
                entity.getAffecteeLe(),
                entity.getLancee(),
                entity.isCompositionVerifiee(),
                entity.getPoidsEstimeKg()
        );
    }

    public static TourneePlanifieeEntity toEntity(TourneePlanifiee domain) {
        return new TourneePlanifieeEntity(
                domain.getId(),
                domain.getCodeTms(),
                domain.getDate(),
                domain.getNbColis(),
                serializeZones(domain.getZones()),
                serializeContraintes(domain.getContraintes()),
                serializeAnomalies(domain.getAnomalies()),
                domain.getImporteeLe(),
                domain.getStatut(),
                domain.getLivreurId(),
                domain.getLivreurNom(),
                domain.getVehiculeId(),
                domain.getAffecteeLe(),
                domain.getLancee(),
                domain.isCompositionVerifiee(),
                domain.getPoidsEstimeKg()
        );
    }

    // ─── Serialization helpers ─────────────────────────────────────────────────

    private static String serializeZones(List<ZoneTournee> zones) {
        try {
            return MAPPER.writeValueAsString(zones.stream()
                    .map(z -> new ZoneJson(z.getNom(), z.getNbColis()))
                    .toList());
        } catch (Exception e) {
            return "[]";
        }
    }

    private static List<ZoneTournee> parseZones(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<ZoneJson> raw = MAPPER.readValue(json, new TypeReference<>() {});
            return raw.stream().map(z -> new ZoneTournee(z.nom(), z.nbColis())).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String serializeContraintes(List<ContrainteHoraire> contraintes) {
        try {
            return MAPPER.writeValueAsString(contraintes.stream()
                    .map(c -> new ContrainteJson(c.getLibelle(), c.getNbColisAffectes()))
                    .toList());
        } catch (Exception e) {
            return "[]";
        }
    }

    private static List<ContrainteHoraire> parseContraintes(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<ContrainteJson> raw = MAPPER.readValue(json, new TypeReference<>() {});
            return raw.stream().map(c -> new ContrainteHoraire(c.libelle(), c.nbColisAffectes())).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String serializeAnomalies(List<Anomalie> anomalies) {
        try {
            return MAPPER.writeValueAsString(anomalies.stream()
                    .map(a -> new AnomalieJson(a.getCode(), a.getDescription()))
                    .toList());
        } catch (Exception e) {
            return "[]";
        }
    }

    private static List<Anomalie> parseAnomalies(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            List<AnomalieJson> raw = MAPPER.readValue(json, new TypeReference<>() {});
            return raw.stream().map(a -> new Anomalie(a.code(), a.description())).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    // ─── Internal records for JSON ─────────────────────────────────────────────

    record ZoneJson(String nom, int nbColis) {}
    record ContrainteJson(String libelle, int nbColisAffectes) {}
    record AnomalieJson(String code, String description) {}
}
