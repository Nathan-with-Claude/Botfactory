package com.docapost.supervision.domain.model;

import com.docapost.supervision.domain.events.InstructionEnvoyee;
import com.docapost.supervision.domain.events.InstructionExecutee;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Aggregate Root — Instruction (BC-03 Supervision — US-014)
 *
 * Représente une instruction normalisée envoyée par un superviseur à un livreur
 * concernant un colis précis.
 *
 * Invariants :
 * - Une instruction de type REPROGRAMMER requiert un creneauCible non null.
 * - Une instruction créée a toujours le statut ENVOYEE.
 * - L'historique des événements est collecté (pattern collect-and-publish).
 *
 * Factory method : envoyer() — seul point d'entrée pour créer une instruction.
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
public class Instruction {

    private final String instructionId;
    private final String tourneeId;
    private final String colisId;
    private final String superviseurId;
    private final TypeInstruction type;
    private final Instant creneauCible; // nullable sauf REPROGRAMMER
    private StatutInstruction statut;
    private final Instant horodatage;

    private final List<Object> evenements = new ArrayList<>();

    private Instruction(
            String instructionId,
            String tourneeId,
            String colisId,
            String superviseurId,
            TypeInstruction type,
            Instant creneauCible,
            StatutInstruction statut,
            Instant horodatage
    ) {
        this.instructionId = Objects.requireNonNull(instructionId);
        this.tourneeId = Objects.requireNonNull(tourneeId);
        this.colisId = Objects.requireNonNull(colisId);
        this.superviseurId = Objects.requireNonNull(superviseurId);
        this.type = Objects.requireNonNull(type);
        this.creneauCible = creneauCible;
        this.statut = Objects.requireNonNull(statut);
        this.horodatage = horodatage != null ? horodatage : Instant.now();
    }

    /**
     * Factory method — crée et valide une nouvelle instruction.
     *
     * @param instructionId identifiant unique (UUID v4 recommandé)
     * @param tourneeId identifiant de la tournée concernée
     * @param colisId identifiant du colis concerné
     * @param superviseurId identifiant du superviseur émetteur
     * @param type type d'instruction (PRIORISER | ANNULER | REPROGRAMMER)
     * @param creneauCible créneau cible (obligatoire si REPROGRAMMER, null sinon)
     * @return nouvelle Instruction avec statut ENVOYEE et événement InstructionEnvoyee collecté
     * @throws IllegalArgumentException si REPROGRAMMER sans créneau
     */
    public static Instruction envoyer(
            String instructionId,
            String tourneeId,
            String colisId,
            String superviseurId,
            TypeInstruction type,
            Instant creneauCible
    ) {
        if (type == TypeInstruction.REPROGRAMMER && creneauCible == null) {
            throw new IllegalArgumentException(
                    "Une instruction REPROGRAMMER requiert un créneau cible (date + heure)."
            );
        }

        Instruction instruction = new Instruction(
                instructionId, tourneeId, colisId, superviseurId,
                type, creneauCible, StatutInstruction.ENVOYEE, Instant.now()
        );

        instruction.evenements.add(new InstructionEnvoyee(
                instructionId, tourneeId, colisId, superviseurId, type, creneauCible
        ));

        return instruction;
    }

    /**
     * Reconstruit une instruction depuis la persistance (pas d'événement émis).
     */
    public static Instruction reconstruire(
            String instructionId, String tourneeId, String colisId,
            String superviseurId, TypeInstruction type, Instant creneauCible,
            StatutInstruction statut, Instant horodatage
    ) {
        return new Instruction(
                instructionId, tourneeId, colisId, superviseurId,
                type, creneauCible, statut, horodatage
        );
    }

    /**
     * Prend en compte l'instruction par le livreur (lecture dans "Mes consignes" M-07).
     * Transition : ENVOYEE → PRISE_EN_COMPTE.
     * Idempotent : si déjà PRISE_EN_COMPTE, ne fait rien.
     *
     * @param livreurId identifiant du livreur qui prend en compte l'instruction
     * @throws IllegalStateException si l'instruction est déjà EXECUTEE ou REFUSEE
     *
     * Source : US-037 delta Sprint 5 — InstructionPriseEnCompte
     */
    public void prendreEnCompte(String livreurId) {
        if (this.statut == StatutInstruction.PRISE_EN_COMPTE) {
            // Idempotent — déjà prise en compte, pas d'effet
            return;
        }
        if (this.statut != StatutInstruction.ENVOYEE) {
            throw new IllegalStateException(
                    "Impossible de prendre en compte une instruction au statut " + this.statut
            );
        }
        this.statut = StatutInstruction.PRISE_EN_COMPTE;
    }

    /**
     * Marque l'instruction comme exécutée par le livreur.
     * Transition : ENVOYEE ou PRISE_EN_COMPTE → EXECUTEE.
     * Collecte l'événement InstructionExecutee.
     *
     * @param livreurId identifiant du livreur qui exécute l'instruction
     * @throws IllegalStateException si l'instruction n'est pas au statut ENVOYEE ou PRISE_EN_COMPTE
     */
    public void marquerExecutee(String livreurId) {
        if (this.statut != StatutInstruction.ENVOYEE
                && this.statut != StatutInstruction.PRISE_EN_COMPTE) {
            throw new IllegalStateException(
                    "Impossible de marquer exécutée une instruction au statut " + this.statut
            );
        }
        this.statut = StatutInstruction.EXECUTEE;
        evenements.add(new InstructionExecutee(instructionId, tourneeId, colisId, livreurId));
    }

    /** Retourne et vide la liste des événements collectés (pattern collect-and-publish). */
    public List<Object> getEvenements() {
        return Collections.unmodifiableList(evenements);
    }

    public void clearEvenements() {
        evenements.clear();
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    public String getInstructionId() { return instructionId; }
    public String getTourneeId() { return tourneeId; }
    public String getColisId() { return colisId; }
    public String getSuperviseurId() { return superviseurId; }
    public TypeInstruction getType() { return type; }
    public Instant getCreneauCible() { return creneauCible; }
    public StatutInstruction getStatut() { return statut; }
    public Instant getHorodatage() { return horodatage; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Instruction that)) return false;
        return Objects.equals(instructionId, that.instructionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(instructionId);
    }
}
