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
     *
     * Regles de comptage :
     * - colisLivres    : statut = LIVRE
     * - colisARepresenter : statut = ECHEC ET disposition = A_REPRESENTER
     * - colisEchecs    : statut = ECHEC ET disposition != A_REPRESENTER (ou null)
     *
     * Note : StatutColis.A_REPRESENTER est un statut legacy non emis par
     * declarerEchecLivraison() — la disposition A_REPRESENTER est portee par
     * le champ Disposition du Colis en statut ECHEC.
     */
    public static RecapitulatifTournee calculer(java.util.List<Colis> colis) {
        int total = colis.size();
        int livres = (int) colis.stream()
                .filter(c -> c.getStatut() == StatutColis.LIVRE)
                .count();
        int aRepresenter = (int) colis.stream()
                .filter(c -> c.getStatut() == StatutColis.ECHEC
                        && c.getDisposition() == Disposition.A_REPRESENTER)
                .count();
        int echecs = (int) colis.stream()
                .filter(c -> c.getStatut() == StatutColis.ECHEC
                        && c.getDisposition() != Disposition.A_REPRESENTER)
                .count();
        return new RecapitulatifTournee(total, livres, echecs, aRepresenter);
    }
}
