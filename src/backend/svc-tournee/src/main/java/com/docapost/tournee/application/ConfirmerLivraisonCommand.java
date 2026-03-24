package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.preuves.model.Coordonnees;
import com.docapost.tournee.domain.preuves.model.TypePreuve;

/**
 * Command — ConfirmerLivraison (US-008 + US-009)
 *
 * Encapsule les données nécessaires pour créer une PreuveLivraison
 * et confirmer la livraison d'un colis.
 *
 * Factory methods selon le type de preuve :
 * - pourSignature() : signature numérique (US-008)
 * - pourPhoto()     : photo du colis déposé (US-009 SC1)
 * - pourTiers()     : tiers identifié (US-009 SC2)
 * - pourDepotSecurise() : dépôt sécurisé (US-009 SC4)
 */
public class ConfirmerLivraisonCommand {

    private final TourneeId tourneeId;
    private final ColisId colisId;
    private final TypePreuve typePreuve;
    private final Coordonnees coordonnees;

    // Champs selon typePreuve (un seul non-null)
    private final byte[] donneesSignature;    // SIGNATURE
    private final String urlPhoto;            // PHOTO
    private final String hashIntegrite;       // PHOTO
    private final String nomTiers;            // TIERS_IDENTIFIE
    private final String descriptionDepot;    // DEPOT_SECURISE

    private ConfirmerLivraisonCommand(
            TourneeId tourneeId, ColisId colisId, TypePreuve typePreuve,
            Coordonnees coordonnees,
            byte[] donneesSignature, String urlPhoto, String hashIntegrite,
            String nomTiers, String descriptionDepot
    ) {
        this.tourneeId = tourneeId;
        this.colisId = colisId;
        this.typePreuve = typePreuve;
        this.coordonnees = coordonnees;
        this.donneesSignature = donneesSignature;
        this.urlPhoto = urlPhoto;
        this.hashIntegrite = hashIntegrite;
        this.nomTiers = nomTiers;
        this.descriptionDepot = descriptionDepot;
    }

    // ─── Factory methods ──────────────────────────────────────────────────────

    public static ConfirmerLivraisonCommand pourSignature(
            TourneeId tourneeId, ColisId colisId,
            byte[] donneesSignature, Coordonnees coordonnees
    ) {
        return new ConfirmerLivraisonCommand(
                tourneeId, colisId, TypePreuve.SIGNATURE, coordonnees,
                donneesSignature, null, null, null, null
        );
    }

    public static ConfirmerLivraisonCommand pourPhoto(
            TourneeId tourneeId, ColisId colisId,
            String urlPhoto, String hashIntegrite, Coordonnees coordonnees
    ) {
        return new ConfirmerLivraisonCommand(
                tourneeId, colisId, TypePreuve.PHOTO, coordonnees,
                null, urlPhoto, hashIntegrite, null, null
        );
    }

    public static ConfirmerLivraisonCommand pourTiers(
            TourneeId tourneeId, ColisId colisId,
            String nomTiers, Coordonnees coordonnees
    ) {
        return new ConfirmerLivraisonCommand(
                tourneeId, colisId, TypePreuve.TIERS_IDENTIFIE, coordonnees,
                null, null, null, nomTiers, null
        );
    }

    public static ConfirmerLivraisonCommand pourDepotSecurise(
            TourneeId tourneeId, ColisId colisId,
            String descriptionDepot, Coordonnees coordonnees
    ) {
        return new ConfirmerLivraisonCommand(
                tourneeId, colisId, TypePreuve.DEPOT_SECURISE, coordonnees,
                null, null, null, null, descriptionDepot
        );
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    public TourneeId getTourneeId() { return tourneeId; }
    public ColisId getColisId() { return colisId; }
    public TypePreuve getTypePreuve() { return typePreuve; }
    public Coordonnees getCoordonnees() { return coordonnees; }
    public byte[] getDonneesSignature() { return donneesSignature; }
    public String getUrlPhoto() { return urlPhoto; }
    public String getHashIntegrite() { return hashIntegrite; }
    public String getNomTiers() { return nomTiers; }
    public String getDescriptionDepot() { return descriptionDepot; }
}
