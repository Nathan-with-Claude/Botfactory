package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — ConsulterInstructionsParTourneeHandler (US-015)
 */
@ExtendWith(MockitoExtension.class)
class ConsulterInstructionsParTourneeHandlerTest {

    @Mock
    private InstructionRepository instructionRepository;

    @InjectMocks
    private ConsulterInstructionsParTourneeHandler handler;

    @Test
    @DisplayName("retourne la liste des instructions d'une tournée")
    void retourne_instructions_de_la_tournee() {
        Instruction i1 = Instruction.envoyer("instr-01", "t-001", "c-001", "sup-001",
                TypeInstruction.PRIORISER, null);
        Instruction i2 = Instruction.envoyer("instr-02", "t-001", "c-002", "sup-001",
                TypeInstruction.ANNULER, null);
        when(instructionRepository.findByTourneeId("t-001")).thenReturn(List.of(i1, i2));

        List<Instruction> result = handler.handle(new ConsulterInstructionsParTourneeQuery("t-001"));

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Instruction::getTourneeId).containsOnly("t-001");
        verify(instructionRepository).findByTourneeId("t-001");
    }

    @Test
    @DisplayName("retourne une liste vide si aucune instruction")
    void retourne_liste_vide_si_aucune_instruction() {
        when(instructionRepository.findByTourneeId("t-999")).thenReturn(List.of());

        List<Instruction> result = handler.handle(new ConsulterInstructionsParTourneeQuery("t-999"));

        assertThat(result).isEmpty();
    }
}
