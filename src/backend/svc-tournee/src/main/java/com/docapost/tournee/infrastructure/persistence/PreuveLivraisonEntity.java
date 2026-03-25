package com.docapost.tournee.infrastructure.persistence;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * JPA Entity — Persistance d'une PreuveLivraison (BC-02).
 *
 * Décisions MVP :
 * - Les données binaires de signature sont stockées en colonne BYTEA (PostgreSQL) ou BLOB (H2).
 * - Les métadonnées photo (urlPhoto, hashIntegrite) sont stockées en colonnes texte.
 * - Le champ typePreuve détermine quel ensemble de colonnes est non-null.
 * - Les coordonnées GPS sont stockées en deux colonnes nullable (mode dégradé).
 *
 * TODO : migrer vers svc-gestion-preuves (BC-02 séparé) quand ce service sera créé.
 */
@Entity
@Table(name = "preuves_livraison")
public class PreuveLivraisonEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "colis_id", nullable = false, updatable = false)
    private String colisId;

    @Column(name = "tournee_id", nullable = false, updatable = false)
    private String tourneeId;

    @Column(name = "type_preuve", nullable = false, updatable = false)
    private String typePreuve;

    @Column(name = "horodatage", nullable = false, updatable = false)
    private Instant horodatage;

    // GPS — nullable (mode dégradé)
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "mode_degrade_gps", nullable = false)
    private boolean modeDegradeGps;

    // SIGNATURE — nullable si autre type
    @Column(name = "donnees_signature", columnDefinition = "BYTEA")
    private byte[] donneesSignature;

    // PHOTO — nullable si autre type
    @Column(name = "url_photo", length = 1024)
    private String urlPhoto;

    @Column(name = "hash_integrite", length = 128)
    private String hashIntegrite;

    // TIERS_IDENTIFIE — nullable si autre type
    @Column(name = "nom_tiers", length = 256)
    private String nomTiers;

    // DEPOT_SECURISE — nullable si autre type
    @Column(name = "description_depot", length = 512)
    private String descriptionDepot;

    protected PreuveLivraisonEntity() {}

    // ─── Getters/Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getColisId() { return colisId; }
    public void setColisId(String colisId) { this.colisId = colisId; }

    public String getTourneeId() { return tourneeId; }
    public void setTourneeId(String tourneeId) { this.tourneeId = tourneeId; }

    public String getTypePreuve() { return typePreuve; }
    public void setTypePreuve(String typePreuve) { this.typePreuve = typePreuve; }

    public Instant getHorodatage() { return horodatage; }
    public void setHorodatage(Instant horodatage) { this.horodatage = horodatage; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public boolean isModeDegradeGps() { return modeDegradeGps; }
    public void setModeDegradeGps(boolean modeDegradeGps) { this.modeDegradeGps = modeDegradeGps; }

    public byte[] getDonneesSignature() { return donneesSignature; }
    public void setDonneesSignature(byte[] donneesSignature) { this.donneesSignature = donneesSignature; }

    public String getUrlPhoto() { return urlPhoto; }
    public void setUrlPhoto(String urlPhoto) { this.urlPhoto = urlPhoto; }

    public String getHashIntegrite() { return hashIntegrite; }
    public void setHashIntegrite(String hashIntegrite) { this.hashIntegrite = hashIntegrite; }

    public String getNomTiers() { return nomTiers; }
    public void setNomTiers(String nomTiers) { this.nomTiers = nomTiers; }

    public String getDescriptionDepot() { return descriptionDepot; }
    public void setDescriptionDepot(String descriptionDepot) { this.descriptionDepot = descriptionDepot; }
}
