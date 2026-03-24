package com.docapost.tournee.domain.model;

/**
 * Value Object — RecapitulatifTournee
 *
 * Synthese de la tournee produite lors de la cloture.
 * Attributs : colisTotal, colisLivres, colisEchecs, colisARepresenter.
 *
 * Immuable. Produit par Tournee.cloturerTournee().
 * Porte par le Domain Event TourneeCloturee.
 *
 * Source : US-007 — "Voir immediatement un recapitulatif de ma journee." (Pierre)
 */
public record RecapitulatifTournee(
        int colisTotal,
        int colisLivres,
        int colisEchecs,
        int colisARepresenter
) {
    /**
     * Calcule le recapitulatif a partir de la liste des colis de la tournee.
     */
    public static RecapitulatifTournee calculer(java.util.List<Colis> colis) {
        int total = colis.size();
        int livres = (int) colis.stream().filter(c -> c.getStatut() == StatutColis.LIVRE).count();
        int echecs = (int) colis.stream().filter(c -> c.getStatut() == StatutColis.ECHEC).count();
        int aRepresenter = (int) colis.stream().filter(c -> c.getStatut() == StatutColis.A_REPRESENTER).count();
        return new RecapitulatifTournee(total, livres, echecs, aRepresenter);
    }
}
