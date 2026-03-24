package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Application Service — Envoyer une instruction à un livreur (US-014)
 *
 * Orchestration :
 * 1. Vérifie qu'aucune instruction n'est déjà en attente pour ce colis.
 * 2. Crée l'Instruction via la factory (validation des invariants domaine).
 * 3. Sauvegarde l'instruction.
 * 4. Publie les événements domaine collectés (InstructionEnvoyee).
 * 5. Broadcast WebSocket pour mise à jour du tableau de bord.
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
@Service
public class EnvoyerInstructionHandler {

    private final InstructionRepository instructionRepository;
    private final TableauDeBordBroadcaster broadcaster;

    public EnvoyerInstructionHandler(
            InstructionRepository instructionRepository,
            TableauDeBordBroadcaster broadcaster
    ) {
        this.instructionRepository = instructionRepository;
        this.broadcaster = broadcaster;
    }

    /**
     * Traite la commande d'envoi d'instruction.
     *
     * @param command commande contenant tourneeId, colisId, superviseurId, type, creneauCible
     * @return l'Instruction créée et persistée
     * @throws InstructionDejaEnAttenteException si une instruction ENVOYEE existe déjà pour ce colis
     * @throws IllegalArgumentException si REPROGRAMMER sans creneauCible
     */
    public Instruction handle(EnvoyerInstructionCommand command) {
        // Vérifier l'invariant : une seule instruction en attente par colis
        instructionRepository.findInstructionEnAttenteParColis(command.colisId())
                .ifPresent(existing -> {
                    throw new InstructionDejaEnAttenteException(command.colisId());
                });

        // Créer l'instruction via la factory domaine (valide les invariants)
        Instruction instruction = Instruction.envoyer(
                UUID.randomUUID().toString(),
                command.tourneeId(),
                command.colisId(),
                command.superviseurId(),
                command.typeInstruction(),
                command.creneauCible()
        );

        // Persister (collect-and-publish : publier après sauvegarde)
        instructionRepository.save(instruction);
        instruction.clearEvenements();

        // Broadcast WebSocket tableau de bord
        broadcaster.broadcastTableauDeBord();

        return instruction;
    }
}
