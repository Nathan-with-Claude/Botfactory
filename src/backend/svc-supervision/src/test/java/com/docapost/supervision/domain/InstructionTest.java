package com.docapost.supervision.domain;

import com.docapost.supervision.domain.events.InstructionEnvoyee;
import com.docapost.supervision.domain.events.InstructionExecutee;
import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests TDD — Instruction aggregate (US-014)
 */
class InstructionTest {

    @Test
    @DisplayName("envoyer crée une instruction PRIORISER avec statut ENVOYEE")
    void envoyer_cree_instruction_prioriser() {
        Instruction instruction = Instruction.envoyer(
                "instr-001", "t-001", "c-001", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );

        assertThat(instruction.getInstructionId()).isEqualTo("instr-001");
        assertThat(instruction.getColisId()).isEqualTo("c-001");
        assertThat(instruction.getType()).isEqualTo(TypeInstruction.PRIORISER);
        assertThat(instruction.getStatut()).isEqualTo(StatutInstruction.ENVOYEE);
        assertThat(instruction.getHorodatage()).isNotNull();
        assertThat(instruction.getCreneauCible()).isNull();
    }

    @Test
    @DisplayName("envoyer crée une instruction ANNULER sans créneau")
    void envoyer_cree_instruction_annuler() {
        Instruction instruction = Instruction.envoyer(
                "instr-002", "t-001", "c-002", "superviseur-001",
                TypeInstruction.ANNULER, null
        );

        assertThat(instruction.getType()).isEqualTo(TypeInstruction.ANNULER);
        assertThat(instruction.getStatut()).isEqualTo(StatutInstruction.ENVOYEE);
        assertThat(instruction.getCreneauCible()).isNull();
    }

    @Test
    @DisplayName("envoyer REPROGRAMMER avec créneau valide est accepté")
    void envoyer_reprogrammer_avec_creneau_valide() {
        Instant creneau = Instant.parse("2026-03-25T10:00:00Z");
        Instruction instruction = Instruction.envoyer(
                "instr-003", "t-001", "c-003", "superviseur-001",
                TypeInstruction.REPROGRAMMER, creneau
        );

        assertThat(instruction.getType()).isEqualTo(TypeInstruction.REPROGRAMMER);
        assertThat(instruction.getCreneauCible()).isEqualTo(creneau);
    }

    @Test
    @DisplayName("envoyer REPROGRAMMER sans créneau lève une exception métier")
    void envoyer_reprogrammer_sans_creneau_leve_exception() {
        assertThatThrownBy(() ->
                Instruction.envoyer("instr-004", "t-001", "c-004", "superviseur-001",
                        TypeInstruction.REPROGRAMMER, null)
        )
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("créneau");
    }

    @Test
    @DisplayName("émet l'événement InstructionEnvoyee à la création")
    void envoyer_emet_evenement_instruction_envoyee() {
        Instruction instruction = Instruction.envoyer(
                "instr-005", "t-001", "c-005", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );

        assertThat(instruction.getEvenements()).hasSize(1);
        InstructionEnvoyee event = (InstructionEnvoyee) instruction.getEvenements().get(0);
        assertThat(event.instructionId()).isEqualTo("instr-005");
        assertThat(event.type()).isEqualTo(TypeInstruction.PRIORISER);
    }

    @Test
    @DisplayName("marquerExecutee transition ENVOYEE → EXECUTEE")
    void marquerExecutee_transition_envoyee_vers_executee() {
        Instruction instruction = Instruction.envoyer(
                "instr-006", "t-001", "c-006", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );
        instruction.clearEvenements();

        instruction.marquerExecutee("livreur-001");

        assertThat(instruction.getStatut()).isEqualTo(StatutInstruction.EXECUTEE);
        assertThat(instruction.getEvenements()).hasSize(1);
        InstructionExecutee event = (InstructionExecutee) instruction.getEvenements().get(0);
        assertThat(event.instructionId()).isEqualTo("instr-006");
        assertThat(event.livreurId()).isEqualTo("livreur-001");
    }

    @Test
    @DisplayName("marquerExecutee sur instruction déjà EXECUTEE lève IllegalStateException")
    void marquerExecutee_deja_executee_leve_exception() {
        Instruction instruction = Instruction.envoyer(
                "instr-007", "t-001", "c-007", "superviseur-001",
                TypeInstruction.ANNULER, null
        );
        instruction.marquerExecutee("livreur-001");
        instruction.clearEvenements();

        assertThatThrownBy(() -> instruction.marquerExecutee("livreur-001"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("EXECUTEE");
    }
}
