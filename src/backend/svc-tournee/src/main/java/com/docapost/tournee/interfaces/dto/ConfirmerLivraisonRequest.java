package com.docapost.tournee.interfaces.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO — Corps de la requête POST /api/tournees/{tourneeId}/colis/{colisId}/livraison
 *
 * Le champ typePreuve discrimine les champs optionnels :
 * - SIGNATURE    : donneesSignature obligatoires (base64 string)
 * - PHOTO        : urlPhoto + hashIntegrite obligatoires
 * - TIERS_IDENTIFIE : nomTiers obligatoire
 * - DEPOT_SECURISE  : descriptionDepot obligatoire
 *
 * coordonneesGps : optionnel — null si signal GPS indisponible (mode dégradé).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConfirmerLivraisonRequest(
        String typePreuve,
        CoordoneesGpsDTO coordonneesGps,

        // SIGNATURE (US-008)
        String donneesSignature,

        // PHOTO (US-009 SC1)
        String urlPhoto,
        String hashIntegrite,

        // TIERS_IDENTIFIE (US-009 SC2)
        String nomTiers,

        // DEPOT_SECURISE (US-009 SC4)
        String descriptionDepot
) {
    public record CoordoneesGpsDTO(double latitude, double longitude) {}
}
