package com.docapost.supervision.interfaces;

import com.docapost.supervision.application.*;
import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;
import com.docapost.supervision.interfaces.rest.InstructionController;
import com.docapost.supervision.interfaces.security.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests @WebMvcTest — InstructionController (US-014 + US-015)
 */
@WebMvcTest(InstructionController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class InstructionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EnvoyerInstructionHandler envoyerInstructionHandler;

    @MockBean
    private MarquerInstructionExecuteeHandler marquerExecuteeHandler;

    @MockBean
    private ConsulterInstructionsParTourneeHandler consulterParTourneeHandler;

    @MockBean
    private ConsulterInstructionsEnAttenteHandler consulterEnAttenteHandler;

    @MockBean
    private PrendreEnCompteInstructionHandler prendreEnCompteHandler;

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Test
    @DisplayName("POST /api/supervision/instructions retourne 201 avec l'instruction créée")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void envoyerInstruction_retourne_201_avec_instruction() throws Exception {
        Instruction instruction = Instruction.envoyer(
                "instr-uuid-001", "t-001", "c-001",
                "superviseur-001", TypeInstruction.PRIORISER, null
        );
        when(envoyerInstructionHandler.handle(any())).thenReturn(instruction);

        String body = mapper.writeValueAsString(Map.of(
                "tourneeId", "t-001",
                "colisId", "c-001",
                "typeInstruction", "PRIORISER"
        ));

        mockMvc.perform(post("/api/supervision/instructions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.instructionId").value("instr-uuid-001"))
                .andExpect(jsonPath("$.colisId").value("c-001"))
                .andExpect(jsonPath("$.typeInstruction").value("PRIORISER"))
                .andExpect(jsonPath("$.statut").value("ENVOYEE"));
    }

    @Test
    @DisplayName("POST /api/supervision/instructions retourne 409 si instruction déjà en attente")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void envoyerInstruction_retourne_409_si_deja_en_attente() throws Exception {
        when(envoyerInstructionHandler.handle(any()))
                .thenThrow(new InstructionDejaEnAttenteException("c-001"));

        String body = mapper.writeValueAsString(Map.of(
                "tourneeId", "t-001",
                "colisId", "c-001",
                "typeInstruction", "PRIORISER"
        ));

        mockMvc.perform(post("/api/supervision/instructions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/supervision/instructions retourne 422 si REPROGRAMMER sans créneau")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void envoyerInstruction_retourne_422_si_reprogrammer_sans_creneau() throws Exception {
        when(envoyerInstructionHandler.handle(any()))
                .thenThrow(new IllegalArgumentException("créneau obligatoire"));

        String body = mapper.writeValueAsString(Map.of(
                "tourneeId", "t-001",
                "colisId", "c-001",
                "typeInstruction", "REPROGRAMMER"
        ));

        mockMvc.perform(post("/api/supervision/instructions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("POST /api/supervision/instructions retourne 403 si non-SUPERVISEUR")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void envoyerInstruction_retourne_403_pour_livreur() throws Exception {
        String body = mapper.writeValueAsString(Map.of(
                "tourneeId", "t-001",
                "colisId", "c-001",
                "typeInstruction", "PRIORISER"
        ));

        mockMvc.perform(post("/api/supervision/instructions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    // ─── US-015 : Suivre l'état d'exécution d'une instruction ────────────────

    @Test
    @DisplayName("GET /instructions/tournee/{id} retourne 200 avec la liste des instructions")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void consulterInstructionsParTournee_retourne_200_avec_liste() throws Exception {
        Instruction i1 = Instruction.envoyer("instr-001", "t-001", "c-001",
                "superviseur-001", TypeInstruction.PRIORISER, null);
        when(consulterParTourneeHandler.handle(any())).thenReturn(List.of(i1));

        mockMvc.perform(get("/api/supervision/instructions/tournee/t-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].instructionId").value("instr-001"))
                .andExpect(jsonPath("$[0].typeInstruction").value("PRIORISER"))
                .andExpect(jsonPath("$[0].statut").value("ENVOYEE"));
    }

    @Test
    @DisplayName("PATCH /instructions/{id}/executer retourne 200 avec statut EXECUTEE")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void marquerExecutee_retourne_200_avec_statut_executee() throws Exception {
        Instruction instruction = Instruction.envoyer("instr-001", "t-001", "c-001",
                "superviseur-001", TypeInstruction.PRIORISER, null);
        instruction.marquerExecutee("livreur-001");
        when(marquerExecuteeHandler.handle(any())).thenReturn(instruction);

        mockMvc.perform(patch("/api/supervision/instructions/instr-001/executer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("EXECUTEE"));
    }

    @Test
    @DisplayName("PATCH /instructions/{id}/executer retourne 404 si instruction inconnue")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void marquerExecutee_retourne_404_si_instruction_inconnue() throws Exception {
        when(marquerExecuteeHandler.handle(any()))
                .thenThrow(new InstructionNotFoundException("instr-inconnu"));

        mockMvc.perform(patch("/api/supervision/instructions/instr-inconnu/executer"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /instructions/en-attente retourne 200 avec instructions ENVOYEE")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void consulterEnAttente_retourne_200_avec_instructions_envoyee() throws Exception {
        Instruction i1 = Instruction.envoyer("instr-001", "t-001", "c-001",
                "superviseur-001", TypeInstruction.PRIORISER, null);
        when(consulterEnAttenteHandler.handle(any())).thenReturn(List.of(i1));

        mockMvc.perform(get("/api/supervision/instructions/en-attente")
                        .param("tourneeId", "t-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].statut").value("ENVOYEE"))
                .andExpect(jsonPath("$[0].tourneeId").value("t-001"));
    }

    // ─── US-037 (delta Sprint 5) : InstructionPriseEnCompte ──────────────────

    @Test
    @DisplayName("PATCH /instructions/{id}/prendre-en-compte retourne 200 avec statut PRISE_EN_COMPTE")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void prendreEnCompte_retourne_200_avec_statut_prise_en_compte() throws Exception {
        Instruction instruction = Instruction.envoyer("instr-001", "t-001", "c-001",
                "superviseur-001", TypeInstruction.PRIORISER, null);
        instruction.prendreEnCompte("livreur-001");
        when(prendreEnCompteHandler.handle(any())).thenReturn(instruction);

        mockMvc.perform(patch("/api/supervision/instructions/instr-001/prendre-en-compte"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("PRISE_EN_COMPTE"));
    }

    @Test
    @DisplayName("PATCH /instructions/{id}/prendre-en-compte retourne 404 si instruction inconnue")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void prendreEnCompte_retourne_404_si_instruction_inconnue() throws Exception {
        when(prendreEnCompteHandler.handle(any()))
                .thenThrow(new InstructionNotFoundException("instr-inconnu"));

        mockMvc.perform(patch("/api/supervision/instructions/instr-inconnu/prendre-en-compte"))
                .andExpect(status().isNotFound());
    }
}
