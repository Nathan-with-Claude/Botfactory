package com.docapost.supervision.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Read Model — VueTournee (BC-03 Supervision — US-011, US-035)
 *
 * Représente la vue agrégée d'une tournée pour le tableau de bord superviseur.
 * Pas un Aggregate : c'est un Read Model (CQRS) mis à jour par des projections
 * ou par les handlers d'alertes (US-013).
 *
 * Champs :
 * - tourneeId       : identifiant de la tournée (référence BC-01)
 * - livreurNom      : nom du livreur pour l'affichage
 * - colisTraites    : nombre de colis livrés ou en échec
 * - colisTotal      : nombre total de colis dans la tournée
 * - pourcentage     : avancement en % (0-100)
 * - statut          : EN_COURS | A_RISQUE | CLOTUREE
 * - derniereActivite : horodatage de la dernière action sur la tournée
 * - codeTMS         : code identifiant de la tournée dans le TMS (ex: "T-205") — US-035
 * - zone            : zone géographique principale de la tournée (ex: "Villeurbanne") — US-035
 *
 * Source : US-011, US-013, US-035 — "Tableau de bord des tournées en temps réel"
 */
public class VueTournee {

    private final String tourneeId;
    private String livreurNom;
    private int colisTraites;
    private int colisTotal;
    private int pourcentage;
    private StatutTourneeVue statut;
    private Instant derniereActivite;
    // US-035 — Champs pour la recherche multi-critères
    private String codeTMS;
    private String zone;

    /**
     * Constructeur minimal (rétrocompatibilité US-011/013) — codeTMS et zone null.
     */
    public VueTournee(
            String tourneeId,
            String livreurNom,
            int colisTraites,
            int colisTotal,
            StatutTourneeVue statut,
            Instant derniereActivite
    ) {
        this(tourneeId, livreurNom, colisTraites, colisTotal, statut, derniereActivite, null, null);
    }

    /**
     * Constructeur complet avec codeTMS et zone (US-035).
     */
    public VueTournee(
            String tourneeId,
            String livreurNom,
            int colisTraites,
            int colisTotal,
            StatutTourneeVue statut,
            Instant derniereActivite,
            String codeTMS,
            String zone
    ) {
        this.tourneeId = Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
        this.livreurNom = Objects.requireNonNull(livreurNom, "LivreurNom est obligatoire");
        this.colisTraites = colisTraites;
        this.colisTotal = colisTotal;
        this.pourcentage = colisTotal > 0 ? (colisTraites * 100 / colisTotal) : 0;
        this.statut = Objects.requireNonNull(statut, "Statut est obligatoire");
        this.derniereActivite = derniereActivite;
        this.codeTMS = codeTMS;
        this.zone = zone;
    }

    /**
     * Met à jour les compteurs d'avancement et recalcule le pourcentage.
     * Utilisé par les projections lors des livraisons/échecs.
     */
    public void mettreAJourAvancement(int colisTraites, int colisTotal) {
        this.colisTraites = colisTraites;
        this.colisTotal = colisTotal;
        this.pourcentage = colisTotal > 0 ? (colisTraites * 100 / colisTotal) : 0;
        this.derniereActivite = Instant.now();
    }

    /**
     * Passe le statut à A_RISQUE (utilisé par RisqueDetector — US-013).
     */
    public void signalerRisque() {
        if (this.statut == StatutTourneeVue.EN_COURS) {
            this.statut = StatutTourneeVue.A_RISQUE;
            this.derniereActivite = Instant.now();
        }
    }

    /**
     * Revient au statut EN_COURS si le risque est résorbé (utilisé par RetourNormaleHandler — US-013).
     */
    public void normaliserStatut() {
        if (this.statut == StatutTourneeVue.A_RISQUE) {
            this.statut = StatutTourneeVue.EN_COURS;
            this.derniereActivite = Instant.now();
        }
    }

    /**
     * Clôture la vue de la tournée (tous les colis traités).
     */
    public void cloturer() {
        this.statut = StatutTourneeVue.CLOTUREE;
        this.derniereActivite = Instant.now();
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    public String getTourneeId() { return tourneeId; }
    public String getLivreurNom() { return livreurNom; }
    public int getColisTraites() { return colisTraites; }
    public int getColisTotal() { return colisTotal; }
    public int getPourcentage() { return pourcentage; }
    public StatutTourneeVue getStatut() { return statut; }
    public Instant getDerniereActivite() { return derniereActivite; }
    public String getCodeTMS() { return codeTMS; }
    public String getZone() { return zone; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VueTournee that)) return false;
        return Objects.equals(tourneeId, that.tourneeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tourneeId);
    }
}
