package com.docapost.tournee.domain.model;

import com.docapost.tournee.domain.events.DomainEvent;
import com.docapost.tournee.domain.events.EchecLivraisonDeclare;
import com.docapost.tournee.domain.events.TourneeCloturee;
import com.docapost.tournee.domain.events.TourneeDemarree;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Aggregate Root — Tournee (BC-01 Orchestration de Tournee)
 *
 * Responsabilite : Gerer le cycle de vie complet d'une tournee de livraison.
 * Toute modification des Colis passe par cet agregat.
 *
 * Invariants :
 * 1. Une Tournee ne peut etre demarree que si elle contient au moins un Colis.
 * 2. Une Tournee ne peut etre cloturee que si tous les Colis ont un statut terminal.
 * 3. L'identifiant du livreur est immuable une fois la Tournee demarree.
 * 4. demarrer() est idempotent : n'emet pas TourneeDemarree si deja demarree.
 * 5. declarerEchecLivraison() : motif et disposition obligatoires, transition A_LIVRER → ECHEC uniquement.
 *
 * Source : "Mon seul outil c'est ma feuille de route." (Pierre)
 */
public class Tournee {

    private final TourneeId id;
    private final LivreurId livreurId;
    private final LocalDate date;
    private StatutTournee statut;
    private final List<Colis> colis;

    // Domain Events en attente de publication (pattern collect-and-publish)
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public Tournee(
            TourneeId id,
            LivreurId livreurId,
            LocalDate date,
            List<Colis> colis,
            StatutTournee statut
    ) {
        this.id = Objects.requireNonNull(id, "TourneeId est obligatoire");
        this.livreurId = Objects.requireNonNull(livreurId, "LivreurId est obligatoire");
        this.date = Objects.requireNonNull(date, "La date est obligatoire");
        this.statut = Objects.requireNonNull(statut, "Le statut est obligatoire");
        this.colis = new ArrayList<>(Objects.requireNonNull(colis, "La liste de colis est obligatoire"));
    }

    /**
     * Demarre la tournee au premier acces de la liste des colis.
     * Emet TourneeDemarree uniquement si la tournee n'est pas encore demarree (idempotent).
     *
     * Invariant : la tournee doit contenir au moins un colis.
     * Source : invariant US-001 — "Le premier acces genere TourneeDemarree (une seule fois par journee)."
     */
    public void demarrer() {
        // Invariant 1 : au moins un colis requis
        if (colis.isEmpty()) {
            throw new TourneeInvariantException(
                    "Une Tournee ne peut etre demarree que si elle contient au moins un colis"
            );
        }

        // Idempotence : ne rien faire si deja demarree
        if (statut == StatutTournee.DEMARREE || statut == StatutTournee.CLOTUREE) {
            return;
        }

        statut = StatutTournee.DEMARREE;
        domainEvents.add(TourneeDemarree.of(id, livreurId));
    }

    /**
     * Declare un echec de livraison pour un colis de la tournee.
     *
     * Invariants appliques :
     * - Le colis doit exister dans cette tournee.
     * - Le motif est obligatoire.
     * - La disposition est obligatoire.
     * - La transition autorisee est : A_LIVRER → ECHEC uniquement.
     *   Un colis deja en ECHEC, LIVRE ou A_REPRESENTER ne peut pas repasser en ECHEC.
     * - Emet EchecLivraisonDeclare horodate.
     *
     * Source : US-005 — "Chaque echec doit etre trace de façon structuree." (Pierre)
     *
     * @param colisId   identifiant du colis concerne
     * @param motif     motif normalise de non-livraison (obligatoire)
     * @param disposition disposition du colis (obligatoire)
     * @param noteLibre note libre optionnelle (max 250 caracteres)
     * @return le Colis mis a jour avec statut ECHEC
     * @throws TourneeInvariantException si le colis n'existe pas dans la tournee,
     *                                   si le motif ou la disposition sont null,
     *                                   ou si la transition de statut est interdite.
     */
    public Colis declarerEchecLivraison(
            ColisId colisId,
            MotifNonLivraison motif,
            Disposition disposition,
            String noteLibre
    ) {
        // Invariant : motif obligatoire
        if (motif == null) {
            throw new TourneeInvariantException(
                    "Le motif de non-livraison est obligatoire pour declarer un echec"
            );
        }

        // Invariant : disposition obligatoire
        if (disposition == null) {
            throw new TourneeInvariantException(
                    "La disposition est obligatoire pour declarer un echec"
            );
        }

        // Rechercher le colis dans la tournee
        Colis colis = this.colis.stream()
                .filter(c -> c.getId().equals(colisId))
                .findFirst()
                .orElseThrow(() -> new TourneeInvariantException(
                        "Colis introuvable dans cette tournee : " + colisId.value()
                ));

        // Invariant : transition autorisée uniquement depuis A_LIVRER
        if (colis.getStatut() == StatutColis.ECHEC) {
            throw new TourneeInvariantException(
                    "Transition interdite : le colis est deja en statut ECHEC"
            );
        }
        if (colis.getStatut() != StatutColis.A_LIVRER) {
            throw new TourneeInvariantException(
                    "Transition interdite : seul un colis en statut A_LIVRER peut passer en ECHEC. "
                            + "Statut actuel : " + colis.getStatut()
            );
        }

        // Appliquer la transition
        colis.setStatut(StatutColis.ECHEC);
        colis.setMotifNonLivraison(motif);
        colis.setDisposition(disposition);

        // Emettre le Domain Event (pattern collect-and-publish)
        domainEvents.add(EchecLivraisonDeclare.of(id, colisId, motif, disposition, noteLibre));

        return colis;
    }

    /**
     * Cloture la tournee apres traitement de tous les colis.
     *
     * Invariants appliques :
     * - Aucun colis ne doit rester en statut A_LIVRER.
     * - Idempotent : si la tournee est deja cloturee, rien n'est fait.
     * - Emet TourneeCloturee avec le recap de la tournee.
     *
     * Source : US-007 — "Confirmer officiellement la fin de ma tournee dans le SI." (Pierre)
     *
     * @throws TourneeInvariantException si au moins un colis est encore au statut A_LIVRER
     */
    public RecapitulatifTournee cloturerTournee() {
        // Idempotence : ne rien faire si deja cloturee
        if (statut == StatutTournee.CLOTUREE) {
            return RecapitulatifTournee.calculer(colis);
        }

        // Invariant : tous les colis doivent avoir un statut terminal
        boolean aDesColisALivrer = colis.stream()
                .anyMatch(c -> c.getStatut() == StatutColis.A_LIVRER);
        if (aDesColisALivrer) {
            throw new TourneeInvariantException(
                    "Une Tournee ne peut etre cloturee que si tous les colis ont un statut terminal. "
                            + "Certains colis sont encore en statut a livrer."
            );
        }

        statut = StatutTournee.CLOTUREE;
        RecapitulatifTournee recap = RecapitulatifTournee.calculer(colis);
        domainEvents.add(TourneeCloturee.of(id, livreurId, recap));
        return recap;
    }

    /**
     * Calcule l'avancement courant de la tournee.
     * colisTraites = nombre de colis dans un statut terminal (LIVRE, ECHEC, A_REPRESENTER).
     * estimationFin : null dans le MVP (fonctionnalite de planification future).
     */
    public Avancement calculerAvancement() {
        int colisTraites = (int) colis.stream()
                .filter(Colis::estTraite)
                .count();
        return new Avancement(colisTraites, colis.size(), null);
    }

    /**
     * Efface les domain events apres publication par l'Application Service.
     * Appele par ConsulterListeColisHandler apres la sauvegarde.
     */
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = List.copyOf(domainEvents);
        domainEvents.clear();
        return events;
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    public TourneeId getId() { return id; }
    public LivreurId getLivreurId() { return livreurId; }
    public LocalDate getDate() { return date; }
    public StatutTournee getStatut() { return statut; }
    public List<Colis> getColis() { return List.copyOf(colis); }

    /**
     * Expose les events en attente (lecture seule, pour les tests).
     * Utiliser pullDomainEvents() pour consommer et vider la liste.
     */
    public List<DomainEvent> getDomainEvents() { return List.copyOf(domainEvents); }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tournee tournee)) return false;
        return Objects.equals(id, tournee.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
