package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.EtatJournalierLivreur;
import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.model.VueLivreur;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.domain.planification.service.LivreurReferentiel;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * ConsulterEtatLivreursHandler — Application Service BC-07 / US-066
 *
 * Pour chaque livreur du référentiel, dérive son EtatJournalierLivreur
 * en interrogeant TourneePlanifieeRepository.
 *
 * Aucune logique métier ici : l'orchestration délègue au domaine.
 *
 * Source : US-066
 */
@Component
public class ConsulterEtatLivreursHandler {

    private final LivreurReferentiel livreurReferentiel;
    private final TourneePlanifieeRepository tourneePlanifieeRepository;

    public ConsulterEtatLivreursHandler(
            LivreurReferentiel livreurReferentiel,
            TourneePlanifieeRepository tourneePlanifieeRepository) {
        this.livreurReferentiel = livreurReferentiel;
        this.tourneePlanifieeRepository = tourneePlanifieeRepository;
    }

    /**
     * Pour chaque livreur du référentiel, dérive son EtatJournalierLivreur
     * pour la date donnée.
     *
     * @param date date du jour (ou date demandée)
     * @return liste de VueLivreur, un élément par livreur du référentiel
     */
    public List<VueLivreur> handle(LocalDate date) {
        return livreurReferentiel.listerLivreurs().stream()
                .map(livreur -> deriveEtat(livreur, date))
                .toList();
    }

    private VueLivreur deriveEtat(LivreurReferentiel.LivreurInfo livreur, LocalDate date) {
        return tourneePlanifieeRepository
                .findByLivreurIdAndDate(livreur.livreurId(), date)
                .map(tp -> switch (tp.getStatut()) {
                    case LANCEE   -> new VueLivreur(
                            livreur.livreurId(), livreur.nomComplet(),
                            EtatJournalierLivreur.EN_COURS,
                            tp.getId(), tp.getCodeTms());
                    case AFFECTEE -> new VueLivreur(
                            livreur.livreurId(), livreur.nomComplet(),
                            EtatJournalierLivreur.AFFECTE_NON_LANCE,
                            tp.getId(), tp.getCodeTms());
                    default       -> sansTournee(livreur);
                })
                .orElseGet(() -> sansTournee(livreur));
    }

    private VueLivreur sansTournee(LivreurReferentiel.LivreurInfo livreur) {
        return new VueLivreur(
                livreur.livreurId(), livreur.nomComplet(),
                EtatJournalierLivreur.SANS_TOURNEE,
                null, null);
    }
}
