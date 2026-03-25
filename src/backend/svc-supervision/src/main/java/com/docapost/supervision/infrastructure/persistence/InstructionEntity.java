package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entité JPA — Instruction (BC-03 Supervision — US-014)
 *
 * Persiste les instructions envoyées par les superviseurs.
 * Correspond à l'Aggregate Root Instruction du domaine.
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
@Entity
@Table(name = "instructions")
public class InstructionEntity {

    @Id
    private String instructionId;

    @Column(nullable = false)
    private String tourneeId;

    @Column(nullable = false)
    private String colisId;

    @Column(nullable = false)
    private String superviseurId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeInstruction type;

    @Column(nullable = true)
    private Instant creneauCible;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutInstruction statut;

    @Column(nullable = false)
    private Instant horodatage;

    protected InstructionEntity() {}

    public InstructionEntity(
            String instructionId, String tourneeId, String colisId,
            String superviseurId, TypeInstruction type, Instant creneauCible,
            StatutInstruction statut, Instant horodatage
    ) {
        this.instructionId = instructionId;
        this.tourneeId = tourneeId;
        this.colisId = colisId;
        this.superviseurId = superviseurId;
        this.type = type;
        this.creneauCible = creneauCible;
        this.statut = statut;
        this.horodatage = horodatage;
    }

    public String getInstructionId() { return instructionId; }
    public String getTourneeId() { return tourneeId; }
    public String getColisId() { return colisId; }
    public String getSuperviseurId() { return superviseurId; }
    public TypeInstruction getType() { return type; }
    public Instant getCreneauCible() { return creneauCible; }
    public StatutInstruction getStatut() { return statut; }
    public Instant getHorodatage() { return horodatage; }

    public void setStatut(StatutInstruction statut) { this.statut = statut; }
}
