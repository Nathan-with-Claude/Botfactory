package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Implémentation JPA du repository Instruction (BC-03 Supervision — US-014).
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
@Repository
public class InstructionRepositoryImpl implements InstructionRepository {

    private final InstructionJpaRepository jpaRepository;

    public InstructionRepositoryImpl(InstructionJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Instruction save(Instruction instruction) {
        InstructionEntity entity = new InstructionEntity(
                instruction.getInstructionId(),
                instruction.getTourneeId(),
                instruction.getColisId(),
                instruction.getSuperviseurId(),
                instruction.getType(),
                instruction.getCreneauCible(),
                instruction.getStatut(),
                instruction.getHorodatage()
        );
        jpaRepository.save(entity);
        return instruction;
    }

    @Override
    public Instruction update(Instruction instruction) {
        jpaRepository.findById(instruction.getInstructionId()).ifPresent(entity -> {
            entity.setStatut(instruction.getStatut());
            jpaRepository.save(entity);
        });
        return instruction;
    }

    @Override
    public Optional<Instruction> findById(String instructionId) {
        return jpaRepository.findById(instructionId)
                .map(this::toInstruction);
    }

    @Override
    public Optional<Instruction> findInstructionEnAttenteParColis(String colisId) {
        return jpaRepository.findByColisIdAndStatut(colisId, StatutInstruction.ENVOYEE)
                .map(this::toInstruction);
    }

    @Override
    public List<Instruction> findByTourneeId(String tourneeId) {
        return jpaRepository.findByTourneeIdOrderByHorodatageDesc(tourneeId)
                .stream().map(this::toInstruction).toList();
    }

    @Override
    public List<Instruction> findEnAttenteParTournee(String tourneeId) {
        return jpaRepository.findByTourneeIdAndStatut(tourneeId, StatutInstruction.ENVOYEE)
                .stream().map(this::toInstruction).toList();
    }

    @Override
    public List<Instruction> findEnCoursParTournee(String tourneeId) {
        return jpaRepository.findByTourneeIdAndStatutIn(tourneeId,
                java.util.List.of(StatutInstruction.ENVOYEE, StatutInstruction.PRISE_EN_COMPTE))
                .stream().map(this::toInstruction).toList();
    }

    private Instruction toInstruction(InstructionEntity e) {
        return Instruction.reconstruire(
                e.getInstructionId(), e.getTourneeId(), e.getColisId(),
                e.getSuperviseurId(), e.getType(), e.getCreneauCible(),
                e.getStatut(), e.getHorodatage()
        );
    }
}
