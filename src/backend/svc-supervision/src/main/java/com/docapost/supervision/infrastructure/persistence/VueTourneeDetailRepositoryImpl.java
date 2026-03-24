package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.IncidentVue;
import com.docapost.supervision.domain.model.VueColis;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.model.VueTourneeDetail;
import com.docapost.supervision.domain.repository.VueTourneeDetailRepository;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Implémentation MVP du repository de détail tournée (US-012).
 *
 * Pour le MVP, les listes de colis et incidents sont stockées dans des tables dédiées.
 * Ce repository compose VueTourneeRepository + VueColisJpa + IncidentVueJpa.
 *
 * TODO Sprint 2 : intégrer une ACL vers BC-01 pour récupérer les vraies données colis.
 */
@Repository
public class VueTourneeDetailRepositoryImpl implements VueTourneeDetailRepository {

    private final VueTourneeRepository vueTourneeRepository;
    private final VueColisJpaRepository vueColisJpaRepository;
    private final IncidentVueJpaRepository incidentVueJpaRepository;

    public VueTourneeDetailRepositoryImpl(
            VueTourneeRepository vueTourneeRepository,
            VueColisJpaRepository vueColisJpaRepository,
            IncidentVueJpaRepository incidentVueJpaRepository
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.incidentVueJpaRepository = incidentVueJpaRepository;
    }

    @Override
    public Optional<VueTourneeDetail> findByTourneeId(String tourneeId) {
        Optional<VueTournee> vueTourneeOpt = vueTourneeRepository.findByTourneeId(tourneeId);
        if (vueTourneeOpt.isEmpty()) {
            return Optional.empty();
        }

        VueTournee vueTournee = vueTourneeOpt.get();

        List<VueColis> colis = vueColisJpaRepository.findByTourneeId(tourneeId)
                .stream()
                .map(e -> new VueColis(
                        e.getColisId(),
                        e.getAdresse(),
                        e.getStatut(),
                        e.getMotifEchec(),
                        e.getHorodatageTraitement()
                ))
                .toList();

        List<IncidentVue> incidents = incidentVueJpaRepository.findByTourneeId(tourneeId)
                .stream()
                .map(e -> new IncidentVue(
                        e.getColisId(),
                        e.getAdresse(),
                        e.getMotif(),
                        e.getHorodatage(),
                        e.getNote()
                ))
                .toList();

        return Optional.of(new VueTourneeDetail(vueTournee, colis, incidents));
    }
}
