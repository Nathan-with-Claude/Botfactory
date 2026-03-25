package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.preuves.model.Coordonnees;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Base64;

/**
 * DTO — Détail d'une PreuveLivraison pour consultation litige (US-010).
 * Retourné par GET /api/preuves/livraison/{colisId}.
 *
 * Champs :
 * - preuveLivraisonId : identifiant de la preuve
 * - colisId           : identifiant du colis
 * - typePreuve        : SIGNATURE | PHOTO | TIERS_IDENTIFIE | DEPOT_SECURISE
 * - horodatage        : timestamp ISO-8601 de la capture
 * - modeDegradeGps    : true si coordonnées GPS indisponibles
 * - coordonneesGps    : latitude/longitude (null si mode dégradé)
 * - aperçuSignature   : données signature en Base64 (null si type != SIGNATURE)
 * - urlPhoto          : URL de la photo (null si type != PHOTO)
 * - hashIntegrite     : hash SHA-256 de la photo (null si type != PHOTO)
 * - nomTiers          : nom du tiers identifié (null si type != TIERS_IDENTIFIE)
 * - descriptionDepot  : description du dépôt sécurisé (null si type != DEPOT_SECURISE)
 *
 * Accès réservé aux rôles SUPPORT / SUPERVISEUR (contrôlé dans PreuveController).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PreuveDetailDTO(
        String preuveLivraisonId,
        String colisId,
        String typePreuve,
        Instant horodatage,
        boolean modeDegradeGps,
        CoordonneesGpsDTO coordonneesGps,
        String aperçuSignature,
        String urlPhoto,
        String hashIntegrite,
        String nomTiers,
        String descriptionDepot
) {

    public record CoordonneesGpsDTO(double latitude, double longitude) {}

    public static PreuveDetailDTO from(PreuveLivraison preuve) {
        CoordonneesGpsDTO coords = null;
        if (preuve.getCoordonnees() != null) {
            Coordonnees c = preuve.getCoordonnees();
            coords = new CoordonneesGpsDTO(c.latitude(), c.longitude());
        }

        String aperçuSignature = null;
        if (preuve.getSignatureNumerique() != null) {
            aperçuSignature = Base64.getEncoder()
                    .encodeToString(preuve.getSignatureNumerique().donneesBase64());
        }

        String urlPhoto = null;
        String hashIntegrite = null;
        if (preuve.getPhotoPreuve() != null) {
            urlPhoto = preuve.getPhotoPreuve().urlPhoto();
            hashIntegrite = preuve.getPhotoPreuve().hashIntegrite();
        }

        String nomTiers = null;
        if (preuve.getTiersIdentifie() != null) {
            nomTiers = preuve.getTiersIdentifie().nomTiers();
        }

        String descriptionDepot = null;
        if (preuve.getDepotSecurise() != null) {
            descriptionDepot = preuve.getDepotSecurise().description();
        }

        return new PreuveDetailDTO(
                preuve.getId().value(),
                preuve.getColisId().value(),
                preuve.getType().name(),
                preuve.getHorodatage(),
                preuve.isModeDegradeGps(),
                coords,
                aperçuSignature,
                urlPhoto,
                hashIntegrite,
                nomTiers,
                descriptionDepot
        );
    }
}
