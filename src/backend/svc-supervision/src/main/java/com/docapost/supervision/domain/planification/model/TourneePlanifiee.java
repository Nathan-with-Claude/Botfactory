package com.docapost.supervision.domain.planification.model;

import com.docapost.supervision.domain.planification.events.AffectationEnregistree;
import com.docapost.supervision.domain.planification.events.CompositionVerifiee;
import com.docapost.supervision.domain.planification.events.TourneeLancee;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * TourneePlanifiee — Aggregate Root du BC-07 Planification
 *
 * Représente une tournée importée depuis le TMS et son cycle de préparation :
 * Import → Vérification composition → Affectation → Lancement
 *
 * Invariants :
 * - Un PlanDuJour correspond exactement à une date calendaire (pas de doublons par date+codeTms)
 * - Une TourneePlanifiee importée ne peut pas être modifiée directement (TMS réimport)
 * - L'affectation est atomique (livreur ET véhicule ensemble)
 * - Un livreur ne peut être affecté qu'à une seule tournée par jour (vérifié au niveau repository)
 * - Un véhicule ne peut être affecté qu'à une seule tournée par jour (vérifié au niveau repository)
 * - Le lancement n'est possible que si statut = AFFECTEE
 * - Le lancement est irréversible
 *
 * Pattern collect-and-publish : les events sont collectés dans l'agrégat,
 * publiés par l'Application Service après sauvegarde.
 *
 * Source : US-021, US-022, US-023, US-024
 */
public class TourneePlanifiee {

    private final String id;
    private final String codeTms;
    private final LocalDate date;
    private final int nbColis;
    private final List<ZoneTournee> zones;
    private final List<ContrainteHoraire> contraintes;
    private final List<Anomalie> anomalies;
    private final Instant importeeLe;

    private StatutAffectation statut;
    private String livreurId;
    private String livreurNom;
    private String vehiculeId;
    private Instant affecteeLe;
    private Instant lancee;
    private boolean compositionVerifiee;

    // Pattern collect-and-publish
    private Integer poidsEstimeKg;

    // Pattern collect-and-publish
    private final List<Object> evenements = new ArrayList<>();

    /**
     * Constructeur principal — crée une TourneePlanifiee au statut NON_AFFECTEE.
     * Utilisé lors de l'import TMS sans poids estimé.
     */
    public TourneePlanifiee(
            String id,
            String codeTms,
            LocalDate date,
            int nbColis,
            List<ZoneTournee> zones,
            List<ContrainteHoraire> contraintes,
            List<Anomalie> anomalies,
            Instant importeeLe
    ) {
        this(id, codeTms, date, nbColis, zones, contraintes, anomalies, importeeLe, null);
    }

    /**
     * Constructeur principal avec poids estimé — crée une TourneePlanifiee au statut NON_AFFECTEE.
     * Utilisé lors de l'import TMS avec poids connu.
     */
    public TourneePlanifiee(
            String id,
            String codeTms,
            LocalDate date,
            int nbColis,
            List<ZoneTournee> zones,
            List<ContrainteHoraire> contraintes,
            List<Anomalie> anomalies,
            Instant importeeLe,
            Integer poidsEstimeKg
    ) {
        this.id = Objects.requireNonNull(id, "L'id est obligatoire");
        this.codeTms = Objects.requireNonNull(codeTms, "Le code TMS est obligatoire");
        this.date = Objects.requireNonNull(date, "La date est obligatoire");
        if (nbColis < 0) throw new IllegalArgumentException("nbColis ne peut pas être négatif");
        this.nbColis = nbColis;
        this.zones = new ArrayList<>(Objects.requireNonNull(zones, "Les zones sont obligatoires"));
        this.contraintes = new ArrayList<>(Objects.requireNonNull(contraintes, "Les contraintes sont obligatoires"));
        this.anomalies = new ArrayList<>(Objects.requireNonNull(anomalies, "Les anomalies sont obligatoires"));
        this.importeeLe = Objects.requireNonNull(importeeLe, "La date d'import est obligatoire");
        this.poidsEstimeKg = poidsEstimeKg;
        this.statut = StatutAffectation.NON_AFFECTEE;
        this.compositionVerifiee = false;
    }

    /**
     * Constructeur de reconstruction depuis la persistance.
     */
    public TourneePlanifiee(
            String id,
            String codeTms,
            LocalDate date,
            int nbColis,
            List<ZoneTournee> zones,
            List<ContrainteHoraire> contraintes,
            List<Anomalie> anomalies,
            Instant importeeLe,
            StatutAffectation statut,
            String livreurId,
            String livreurNom,
            String vehiculeId,
            Instant affecteeLe,
            Instant lancee,
            boolean compositionVerifiee
    ) {
        this(id, codeTms, date, nbColis, zones, contraintes, anomalies, importeeLe, null);
        this.statut = Objects.requireNonNull(statut, "Le statut est obligatoire");
        this.livreurId = livreurId;
        this.livreurNom = livreurNom;
        this.vehiculeId = vehiculeId;
        this.affecteeLe = affecteeLe;
        this.lancee = lancee;
        this.compositionVerifiee = compositionVerifiee;
    }

    /**
     * Constructeur de reconstruction depuis la persistance avec poids estimé.
     */
    public TourneePlanifiee(
            String id,
            String codeTms,
            LocalDate date,
            int nbColis,
            List<ZoneTournee> zones,
            List<ContrainteHoraire> contraintes,
            List<Anomalie> anomalies,
            Instant importeeLe,
            StatutAffectation statut,
            String livreurId,
            String livreurNom,
            String vehiculeId,
            Instant affecteeLe,
            Instant lancee,
            boolean compositionVerifiee,
            Integer poidsEstimeKg
    ) {
        this(id, codeTms, date, nbColis, zones, contraintes, anomalies, importeeLe, poidsEstimeKg);
        this.statut = Objects.requireNonNull(statut, "Le statut est obligatoire");
        this.livreurId = livreurId;
        this.livreurNom = livreurNom;
        this.vehiculeId = vehiculeId;
        this.affecteeLe = affecteeLe;
        this.lancee = lancee;
        this.compositionVerifiee = compositionVerifiee;
    }

    /**
     * US-022 — Valider explicitement la composition.
     * Émet CompositionVerifiee avec horodatage et identifiant du responsable.
     * N'est pas bloquant pour l'affectation : pure traçabilité.
     */
    public void verifierComposition(String superviseurId) {
        Objects.requireNonNull(superviseurId, "L'identifiant du superviseur est obligatoire");
        this.compositionVerifiee = true;
        evenements.add(new CompositionVerifiee(this.id, this.codeTms, superviseurId, Instant.now()));
    }

    /**
     * US-023 — Affecter un livreur et un véhicule à la tournée.
     * L'affectation est atomique : livreur ET véhicule doivent être fournis.
     * Invariant d'unicité (1 livreur/tournée/jour) vérifié par le Repository avant appel.
     *
     * @throws PlanificationInvariantException si la tournée est déjà lancée
     */
    public void affecter(String livreurId, String livreurNom, String vehiculeId, String superviseurId) {
        Objects.requireNonNull(livreurId, "Le livreurId est obligatoire pour l'affectation");
        Objects.requireNonNull(livreurNom, "Le livreurNom est obligatoire pour l'affectation");
        Objects.requireNonNull(vehiculeId, "Le vehiculeId est obligatoire pour l'affectation");
        Objects.requireNonNull(superviseurId, "Le superviseurId est obligatoire pour l'affectation");

        if (this.statut == StatutAffectation.LANCEE) {
            throw new PlanificationInvariantException(
                    "La tournée " + codeTms + " est déjà lancée et ne peut plus être modifiée."
            );
        }

        this.livreurId = livreurId;
        this.livreurNom = livreurNom;
        this.vehiculeId = vehiculeId;
        this.affecteeLe = Instant.now();
        this.statut = StatutAffectation.AFFECTEE;

        evenements.add(new AffectationEnregistree(
                this.id, this.codeTms, livreurId, livreurNom, vehiculeId, superviseurId, this.affecteeLe
        ));
    }

    /**
     * US-024 — Lancer la tournée.
     * Émet TourneeLancee. Le lancement est irréversible.
     *
     * @throws PlanificationInvariantException si le statut n'est pas AFFECTEE (invariant)
     */
    public void lancer(String superviseurId) {
        Objects.requireNonNull(superviseurId, "Le superviseurId est obligatoire pour le lancement");

        if (this.statut != StatutAffectation.AFFECTEE) {
            throw new PlanificationInvariantException(
                    "La tournée " + codeTms + " ne peut être lancée que depuis le statut AFFECTEE. Statut actuel : " + statut
            );
        }

        this.lancee = Instant.now();
        this.statut = StatutAffectation.LANCEE;

        evenements.add(new TourneeLancee(
                this.id, this.codeTms, this.livreurId, this.livreurNom, superviseurId, this.lancee, this.nbColis
        ));
    }

    /**
     * US-028 — Tracer l'export CSV de la composition.
     * Émet CompositionExportee (traçabilité uniquement, aucun changement d'état).
     */
    public void tracerExportComposition(String superviseurId) {
        Objects.requireNonNull(superviseurId, "Le superviseurId est obligatoire");
        evenements.add(new com.docapost.supervision.domain.planification.events.CompositionExportee(
                this.id, this.codeTms, superviseurId, Instant.now()
        ));
    }

    /**
     * US-030 — Évaluer la compatibilité sans side-effect.
     * Retourne POIDS_ABSENT si poidsEstimeKg est null, COMPATIBLE ou DEPASSEMENT sinon.
     */
    public ResultatCompatibilite evaluerCompatibiliteVehicule(Vehicule vehicule) {
        Objects.requireNonNull(vehicule, "Le véhicule est obligatoire");
        if (this.poidsEstimeKg == null) {
            return ResultatCompatibilite.POIDS_ABSENT;
        }
        return vehicule.peutPorter(this.poidsEstimeKg)
                ? ResultatCompatibilite.COMPATIBLE
                : ResultatCompatibilite.DEPASSEMENT;
    }

    /**
     * US-030 SC1 — Vérifier la compatibilité et émettre CompatibiliteVehiculeVerifiee.
     * Lève CapaciteVehiculeDepasseeException si dépassement.
     * No-op si poids absent (SC4).
     */
    public void verifierCompatibiliteVehicule(Vehicule vehicule, String superviseurId) {
        Objects.requireNonNull(vehicule, "Le véhicule est obligatoire");
        Objects.requireNonNull(superviseurId, "Le superviseurId est obligatoire");
        ResultatCompatibilite resultat = evaluerCompatibiliteVehicule(vehicule);
        if (resultat == ResultatCompatibilite.POIDS_ABSENT) {
            return; // SC4 : aucune vérification possible
        }
        if (resultat == ResultatCompatibilite.DEPASSEMENT) {
            throw new CapaciteVehiculeDepasseeException(
                    vehicule.getVehiculeId().getValeur(),
                    vehicule.getCapaciteKg(),
                    this.poidsEstimeKg
            );
        }
        // COMPATIBLE : émettre l'event
        evenements.add(new com.docapost.supervision.domain.planification.events.CompatibiliteVehiculeVerifiee(
                this.id, this.codeTms, vehicule.getVehiculeId().getValeur(),
                this.poidsEstimeKg, vehicule.getCapaciteKg(),
                vehicule.getCapaciteKg() - this.poidsEstimeKg,
                superviseurId, Instant.now()
        ));
    }

    /**
     * US-030 SC3 — Forcer l'affectation malgré le dépassement de capacité.
     * Émet CompatibiliteVehiculeEchouee.
     * Lève PlanificationInvariantException si le véhicule est en réalité compatible.
     */
    public void forcerAffectationMalgreDepassement(Vehicule vehicule, String superviseurId) {
        Objects.requireNonNull(vehicule, "Le véhicule est obligatoire");
        Objects.requireNonNull(superviseurId, "Le superviseurId est obligatoire");
        ResultatCompatibilite resultat = evaluerCompatibiliteVehicule(vehicule);
        if (resultat == ResultatCompatibilite.COMPATIBLE) {
            throw new PlanificationInvariantException(
                    "Le véhicule " + vehicule.getVehiculeId() + " est compatible — le forçage est incohérent."
            );
        }
        int poids = this.poidsEstimeKg != null ? this.poidsEstimeKg : 0;
        evenements.add(new com.docapost.supervision.domain.planification.events.CompatibiliteVehiculeEchouee(
                this.id, this.codeTms, vehicule.getVehiculeId().getValeur(),
                poids, vehicule.getCapaciteKg(),
                poids - vehicule.getCapaciteKg(),
                superviseurId, Instant.now()
        ));
    }

    /**
     * Indique si la tournée présente des anomalies détectées.
     */
    public boolean aDesAnomalies() {
        return !anomalies.isEmpty();
    }

    /**
     * Indique si la tournée est affectable (NON_AFFECTEE ou AFFECTEE mais pas LANCEE).
     */
    public boolean estAffectable() {
        return this.statut != StatutAffectation.LANCEE;
    }

    // ─── Collect-and-Publish ──────────────────────────────────────────────────

    public List<Object> getEvenements() {
        return Collections.unmodifiableList(evenements);
    }

    public void clearEvenements() {
        evenements.clear();
    }

    // ─── Getters ──────────────────────────────────────────────────────────────

    public String getId() { return id; }
    public String getCodeTms() { return codeTms; }
    public LocalDate getDate() { return date; }
    public int getNbColis() { return nbColis; }
    public List<ZoneTournee> getZones() { return Collections.unmodifiableList(zones); }
    public List<ContrainteHoraire> getContraintes() { return Collections.unmodifiableList(contraintes); }
    public List<Anomalie> getAnomalies() { return Collections.unmodifiableList(anomalies); }
    public Instant getImporteeLe() { return importeeLe; }
    public StatutAffectation getStatut() { return statut; }
    public String getLivreurId() { return livreurId; }
    public String getLivreurNom() { return livreurNom; }
    public String getVehiculeId() { return vehiculeId; }
    public Instant getAffecteeLe() { return affecteeLe; }
    public Instant getLancee() { return lancee; }
    public boolean isCompositionVerifiee() { return compositionVerifiee; }
    public Integer getPoidsEstimeKg() { return poidsEstimeKg; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TourneePlanifiee that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}
