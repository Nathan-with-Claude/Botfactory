package com.docapost.tournee.domain.model;

import com.docapost.tournee.domain.events.DomainEvent;
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
