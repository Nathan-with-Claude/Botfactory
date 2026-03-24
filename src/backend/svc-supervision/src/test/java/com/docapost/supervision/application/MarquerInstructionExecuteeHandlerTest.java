package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — MarquerInstructionExecuteeHandler (US-015)
 */
@ExtendWith(MockitoExtension.class)
class MarquerInstructionExecuteeHandlerTest {

    @Mock
    private InstructionRepository instructionRepository;

    @Mock
    private TableauDeBordBroadcaster broadcaster;

    @InjectMocks
    private MarquerInstructionExecuteeHandler handler;

    @Test
    @DisplayName("marquer exécutée met à jour le statut et broadcast WebSocket")
    void marquer_executee_met_a_jour_statut_et_broadcast() {
        Instruction instruction = Instruction.envoyer(
                "instr-001", "t-001", "c-001", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );
        when(instructionRepository.findById("instr-001")).thenReturn(Optional.of(instruction));
        when(instructionRepository.update(any())).thenAnswer(inv -> inv.getArgument(0));

        Instruction result = handler.handle(
                new MarquerInstructionExecuteeCommand("instr-001", "livreur-001")
        );

        assertThat(result.getStatut()).isEqualTo(StatutInstruction.EXECUTEE);
        verify(instructionRepository).update(instruction);
        verify(broadcaster).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("lève InstructionNotFoundException si instruction inconnue")
    void leve_exception_si_instruction_inconnue() {
        when(instructionRepository.findById("instr-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                handler.handle(new MarquerInstructionExecuteeCommand("instr-inconnu", "livreur-001"))
        ).isInstanceOf(InstructionNotFoundException.class);

        verify(instructionRepository, never()).update(any());
        verify(broadcaster, never()).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("lève IllegalStateException si instruction déjà EXECUTEE")
    void leve_exception_si_instruction_deja_executee() {
        Instruction instruction = Instruction.envoyer(
                "instr-002", "t-001", "c-002", "superviseur-001",
                TypeInstruction.ANNULER, null
        );
        instruction.marquerExecutee("livreur-001");
        instruction.clearEvenements();

        when(instructionRepository.findById("instr-002")).thenReturn(Optional.of(instruction));

        assertThatThrownBy(() ->
                handler.handle(new MarquerInstructionExecuteeCommand("instr-002", "livreur-001"))
        ).isInstanceOf(IllegalStateException.class);

        verify(instructionRepository, never()).update(any());
    }
}
