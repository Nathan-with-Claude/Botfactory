package com.docapost.tournee.domain.model;

import java.util.List;
import java.util.Objects;

/**
 * Entity — Colis dans une Tournee.
 * Appartient a l'Aggregate Root Tournee : toute modification passe par la Tournee.
 *
 * Invariants :
 * - Un Colis avec statut LIVRE doit etre associe a une PreuveLivraisonId.
 * - Les transitions de statut autorisees : A_LIVRER → LIVRE | A_LIVRER → ECHEC → A_REPRESENTER
 * - Si statut ECHEC : motifNonLivraison et disposition sont obligatoires.
 *
 * Source : Ubiquitous Language DocuPost — M. Garnier, Pierre.
 */
public class Colis {

    private final ColisId id;
    private final TourneeId tourneeId;
    private StatutColis statut;
    private final Adresse adresseLivraison;
    private final Destinataire destinataire;
    private final List<Contrainte> contraintes;

    // Ajoutés pour US-005 — nuls si statut != ECHEC
    private MotifNonLivraison motifNonLivraison;
    private Disposition disposition;

    public Colis(
            ColisId id,
            TourneeId tourneeId,
            StatutColis statut,
            Adresse adresseLivraison,
            Destinataire destinataire,
            List<Contrainte> contraintes
    ) {
        this.id = Objects.requireNonNull(id, "ColisId est obligatoire");
        this.tourneeId = Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
        this.statut = Objects.requireNonNull(statut, "StatutColis est obligatoire");
        this.adresseLivraison = Objects.requireNonNull(adresseLivraison, "Adresse est obligatoire");
        this.destinataire = Objects.requireNonNull(destinataire, "Destinataire est obligatoire");
        this.contraintes = contraintes != null ? List.copyOf(contraintes) : List.of();
    }

    /**
     * Constructeur étendu incluant motif et disposition (colis déjà en échec, chargé depuis la persistance).
     */
    public Colis(
            ColisId id,
            TourneeId tourneeId,
            StatutColis statut,
            Adresse adresseLivraison,
            Destinataire destinataire,
            List<Contrainte> contraintes,
            MotifNonLivraison motifNonLivraison,
            Disposition disposition
    ) {
        this(id, tourneeId, statut, adresseLivraison, destinataire, contraintes);
        this.motifNonLivraison = motifNonLivraison;
        this.disposition = disposition;
    }

    /**
     * Retourne true si le colis est dans un statut terminal (traite).
     * A_LIVRER est non-terminal. LIVRE, ECHEC, A_REPRESENTER sont terminaux.
     */
    public boolean estTraite() {
        return statut == StatutColis.LIVRE
                || statut == StatutColis.ECHEC
                || statut == StatutColis.A_REPRESENTER;
    }

    /**
     * Retourne true si le colis porte au moins une contrainte horaire.
     */
    public boolean aUneContrainteHoraire() {
        return contraintes.stream().anyMatch(Contrainte::estHoraire);
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    public ColisId getId() { return id; }
    public TourneeId getTourneeId() { return tourneeId; }
    public StatutColis getStatut() { return statut; }
    public Adresse getAdresseLivraison() { return adresseLivraison; }
    public Destinataire getDestinataire() { return destinataire; }
    public List<Contrainte> getContraintes() { return contraintes; }
    public MotifNonLivraison getMotifNonLivraison() { return motifNonLivraison; }
    public Disposition getDisposition() { return disposition; }

    // Package-private pour que Tournee puisse mettre a jour le statut
    void setStatut(StatutColis statut) {
        this.statut = statut;
    }

    // Package-private pour que Tournee puisse enregistrer motif et disposition
    void setMotifNonLivraison(MotifNonLivraison motif) {
        this.motifNonLivraison = motif;
    }

    void setDisposition(Disposition disposition) {
        this.disposition = disposition;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Colis colis)) return false;
        return Objects.equals(id, colis.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
