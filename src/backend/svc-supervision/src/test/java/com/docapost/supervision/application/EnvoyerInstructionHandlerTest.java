package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — EnvoyerInstructionHandler (US-014)
 */
@ExtendWith(MockitoExtension.class)
class EnvoyerInstructionHandlerTest {

    @Mock
    private InstructionRepository instructionRepository;

    @Mock
    private TableauDeBordBroadcaster broadcaster;

    private EnvoyerInstructionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new EnvoyerInstructionHandler(instructionRepository, broadcaster);
    }

    @Test
    @DisplayName("envoi d'une instruction PRIORISER → sauvegardée + broadcast")
    void handle_envoie_instruction_prioriser_et_broadcast() {
        when(instructionRepository.findInstructionEnAttenteParColis("c-001"))
                .thenReturn(Optional.empty());

        EnvoyerInstructionCommand command = new EnvoyerInstructionCommand(
                "t-001", "c-001", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );

        Instruction result = handler.handle(command);

        assertThat(result.getColisId()).isEqualTo("c-001");
        assertThat(result.getType()).isEqualTo(TypeInstruction.PRIORISER);
        assertThat(result.getStatut()).isEqualTo(StatutInstruction.ENVOYEE);

        ArgumentCaptor<Instruction> captor = ArgumentCaptor.forClass(Instruction.class);
        verify(instructionRepository).save(captor.capture());
        assertThat(captor.getValue().getColisId()).isEqualTo("c-001");

        verify(broadcaster).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("instruction déjà en attente → lève InstructionDejaEnAttenteException")
    void handle_leve_exception_si_instruction_deja_en_attente() {
        Instruction existante = Instruction.envoyer(
                "instr-existant", "t-001", "c-001", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );
        when(instructionRepository.findInstructionEnAttenteParColis("c-001"))
                .thenReturn(Optional.of(existante));

        EnvoyerInstructionCommand command = new EnvoyerInstructionCommand(
                "t-001", "c-001", "superviseur-001",
                TypeInstruction.PRIORISER, null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(InstructionDejaEnAttenteException.class);

        verify(instructionRepository, never()).save(any());
        verify(broadcaster, never()).broadcastTableauDeBord();
    }

    @Test
    @DisplayName("instruction REPROGRAMMER sans créneau → lève IllegalArgumentException")
    void handle_leve_exception_si_reprogrammer_sans_creneau() {
        when(instructionRepository.findInstructionEnAttenteParColis(any()))
                .thenReturn(Optional.empty());

        EnvoyerInstructionCommand command = new EnvoyerInstructionCommand(
                "t-001", "c-001", "superviseur-001",
                TypeInstruction.REPROGRAMMER, null
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(IllegalArgumentException.class);

        verify(instructionRepository, never()).save(any());
    }
}
