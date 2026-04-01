package com.docapost.supervision.interfaces.planification.dto;

/**
 * ReaffecterVehiculeRequest — DTO d'entrée REST BC-07 (US-034)
 *
 * Body du POST /api/planification/tournees/{id}/reaffecter-vehicule
 *
 * Source : US-034
 */
public record ReaffecterVehiculeRequest(
        String nouveauVehiculeId
) {}
