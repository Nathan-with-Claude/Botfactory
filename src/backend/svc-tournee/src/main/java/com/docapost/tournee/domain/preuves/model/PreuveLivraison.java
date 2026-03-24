package com.docapost.tournee.domain.preuves.model;

import com.docapost.tournee.domain.events.DomainEvent;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.preuves.events.PreuveCapturee;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Aggregate Root — PreuveLivraison (BC-02 Gestion des Preuves)
 *
 * Responsabilité : Encapsuler la preuve immuable d'une livraison.
 * Une PreuveLivraison est créée une seule fois et ne peut jamais être modifiée
 * (opposabilité juridique — invariant US-008/US-009).
 *
 * Invariants :
 * 1. Une PreuveLivraison doit contenir exactement une donnée de preuve
 *    correspondant à son type (SignatureNumerique, PhotoPreuve, TiersIdentifie ou DepotSecurise).
 * 2. L'horodatage est capturé automatiquement à la création (non modifiable).
 * 3. Les coordonnées GPS peuvent être null si le signal est indisponible (mode dégradé documenté).
 * 4. Une PreuveLivraison ne propose aucune méthode de modification.
 *
 * Création uniquement via les factory methods (méthodes statiques de capture).
 *
 * Source : US-008, US-009 — "Produire une preuve de livraison numérique opposable." (Pierre)
 */
public class PreuveLivraison {

    private final PreuveLivraisonId id;
    private final ColisId colisId;
    private final TourneeId tourneeId;
    private final TypePreuve type;
    private final Instant horodatage;
    private final Coordonnees coordonnees; // null si mode dégradé GPS

    // Exactement un de ces champs est non-null selon le type
    private final SignatureNumerique signatureNumerique;
    private final PhotoPreuve photoPreuve;
    private final TiersIdentifie tiersIdentifie;
    private final DepotSecurise depotSecurise;

    // Domain Events (pattern collect-and-publish)
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    // ─── Constructeur privé ──────────────────────────────────────────────────

    private PreuveLivraison(
            PreuveLivraisonId id,
            ColisId colisId,
            TourneeId tourneeId,
            TypePreuve type,
            Instant horodatage,
            Coordonnees coordonnees,
            SignatureNumerique signatureNumerique,
            PhotoPreuve photoPreuve,
            TiersIdentifie tiersIdentifie,
            DepotSecurise depotSecurise
    ) {
        this.id = Objects.requireNonNull(id);
        this.colisId = Objects.requireNonNull(colisId, "ColisId est obligatoire");
        this.tourneeId = Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
        this.type = Objects.requireNonNull(type, "TypePreuve est obligatoire");
        this.horodatage = Objects.requireNonNull(horodatage, "Horodatage est obligatoire");
        this.coordonnees = coordonnees;
        this.signatureNumerique = signatureNumerique;
        this.photoPreuve = photoPreuve;
        this.tiersIdentifie = tiersIdentifie;
        this.depotSecurise = depotSecurise;
    }

    // ─── Factory methods (US-008 + US-009) ──────────────────────────────────

    /**
     * Capture une signature numérique comme preuve de livraison (US-008).
     *
     * @param colisId       identifiant du colis livré
     * @param tourneeId     identifiant de la tournée
     * @param donneesBase64 données brutes de la signature (tracé vectoriel ou bitmap)
     * @param coordonnees   coordonnées GPS au moment de la capture (null si signal indisponible)
     * @return PreuveLivraison immuable de type SIGNATURE
     * @throws PreuveLivraisonInvariantException si les données de signature sont null ou vides
     */
    public static PreuveLivraison captureSignature(
            ColisId colisId,
            TourneeId tourneeId,
            byte[] donneesBase64,
            Coordonnees coordonnees
    ) {
        if (donneesBase64 == null || donneesBase64.length == 0) {
            throw new PreuveLivraisonInvariantException(
                    "Les donnees de signature sont obligatoires pour une preuve de type SIGNATURE"
            );
        }
        PreuveLivraisonId id = PreuveLivraisonId.generate();
        SignatureNumerique signature = new SignatureNumerique(donneesBase64);
        PreuveLivraison preuve = new PreuveLivraison(
                id, colisId, tourneeId, TypePreuve.SIGNATURE,
                Instant.now(), coordonnees,
                signature, null, null, null
        );
        preuve.emettrePreuveCapturee();
        return preuve;
    }

    /**
     * Capture une photo du colis déposé comme preuve de livraison (US-009 SC1).
     *
     * @param colisId       identifiant du colis livré
     * @param tourneeId     identifiant de la tournée
     * @param urlPhoto      URL de la photo dans l'objet store (MinIO/S3)
     * @param hashIntegrite hash d'intégrité de la photo (SHA-256)
     * @param coordonnees   coordonnées GPS au moment de la capture (null si signal indisponible)
     * @return PreuveLivraison immuable de type PHOTO
     * @throws PreuveLivraisonInvariantException si l'URL est null ou vide
     */
    public static PreuveLivraison capturePhoto(
            ColisId colisId,
            TourneeId tourneeId,
            String urlPhoto,
            String hashIntegrite,
            Coordonnees coordonnees
    ) {
        if (urlPhoto == null || urlPhoto.isBlank()) {
            throw new PreuveLivraisonInvariantException(
                    "L'URL de la photo est obligatoire pour une preuve de type PHOTO"
            );
        }
        PreuveLivraisonId id = PreuveLivraisonId.generate();
        PhotoPreuve photo = new PhotoPreuve(urlPhoto, hashIntegrite);
        PreuveLivraison preuve = new PreuveLivraison(
                id, colisId, tourneeId, TypePreuve.PHOTO,
                Instant.now(), coordonnees,
                null, photo, null, null
        );
        preuve.emettrePreuveCapturee();
        return preuve;
    }

    /**
     * Capture un tiers identifié ayant réceptionné le colis (US-009 SC2).
     *
     * @param colisId     identifiant du colis livré
     * @param tourneeId   identifiant de la tournée
     * @param nomTiers    nom de la personne ayant réceptionné (obligatoire)
     * @param coordonnees coordonnées GPS au moment de la capture (null si signal indisponible)
     * @return PreuveLivraison immuable de type TIERS_IDENTIFIE
     * @throws PreuveLivraisonInvariantException si le nom est null ou vide
     */
    public static PreuveLivraison captureTiers(
            ColisId colisId,
            TourneeId tourneeId,
            String nomTiers,
            Coordonnees coordonnees
    ) {
        if (nomTiers == null || nomTiers.isBlank()) {
            throw new PreuveLivraisonInvariantException(
                    "Le nom du tiers est obligatoire pour une preuve de type TIERS_IDENTIFIE"
            );
        }
        PreuveLivraisonId id = PreuveLivraisonId.generate();
        TiersIdentifie tiers = new TiersIdentifie(nomTiers.trim());
        PreuveLivraison preuve = new PreuveLivraison(
                id, colisId, tourneeId, TypePreuve.TIERS_IDENTIFIE,
                Instant.now(), coordonnees,
                null, null, tiers, null
        );
        preuve.emettrePreuveCapturee();
        return preuve;
    }

    /**
     * Capture un dépôt sécurisé comme preuve de livraison (US-009 SC4).
     *
     * @param colisId     identifiant du colis livré
     * @param tourneeId   identifiant de la tournée
     * @param description description du lieu de dépôt (boîte aux lettres, gardien, etc.)
     * @param coordonnees coordonnées GPS au moment de la capture (null si signal indisponible)
     * @return PreuveLivraison immuable de type DEPOT_SECURISE
     * @throws PreuveLivraisonInvariantException si la description est null ou vide
     */
    public static PreuveLivraison captureDepotSecurise(
            ColisId colisId,
            TourneeId tourneeId,
            String description,
            Coordonnees coordonnees
    ) {
        if (description == null || description.isBlank()) {
            throw new PreuveLivraisonInvariantException(
                    "La description est obligatoire pour une preuve de type DEPOT_SECURISE"
            );
        }
        PreuveLivraisonId id = PreuveLivraisonId.generate();
        DepotSecurise depot = new DepotSecurise(description.trim());
        PreuveLivraison preuve = new PreuveLivraison(
                id, colisId, tourneeId, TypePreuve.DEPOT_SECURISE,
                Instant.now(), coordonnees,
                null, null, null, depot
        );
        preuve.emettrePreuveCapturee();
        return preuve;
    }

    // ─── Helpers privés ──────────────────────────────────────────────────────

    private void emettrePreuveCapturee() {
        domainEvents.add(PreuveCapturee.of(id, colisId, tourneeId, type, coordonnees));
    }

    // ─── Queries ─────────────────────────────────────────────────────────────

    /**
     * Retourne true si la preuve a été capturée sans coordonnées GPS (mode dégradé).
     */
    public boolean isModeDegradeGps() {
        return coordonnees == null;
    }

    /**
     * Consomme et vide la liste des Domain Events (pattern collect-and-publish).
     */
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    public PreuveLivraisonId getId() { return id; }
    public ColisId getColisId() { return colisId; }
    public TourneeId getTourneeId() { return tourneeId; }
    public TypePreuve getType() { return type; }
    public Instant getHorodatage() { return horodatage; }
    public Coordonnees getCoordonnees() { return coordonnees; }
    public SignatureNumerique getSignatureNumerique() { return signatureNumerique; }
    public PhotoPreuve getPhotoPreuve() { return photoPreuve; }
    public TiersIdentifie getTiersIdentifie() { return tiersIdentifie; }
    public DepotSecurise getDepotSecurise() { return depotSecurise; }

    /** Lecture seule pour les tests — utiliser pullDomainEvents() pour consommer. */
    public List<DomainEvent> getDomainEvents() { return List.copyOf(domainEvents); }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PreuveLivraison that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
