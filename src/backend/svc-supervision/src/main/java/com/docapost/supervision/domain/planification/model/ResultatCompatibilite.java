package com.docapost.supervision.domain.planification.model;

/**
 * ResultatCompatibilite — Enumération BC-07 Planification
 *
 * Résultat de la vérification de compatibilité entre le véhicule et la charge de la tournée.
 *
 * Source : US-030
 */
public enum ResultatCompatibilite {
    /** Le poids estimé est inférieur ou égal à la capacité du véhicule. */
    COMPATIBLE,
    /** Le poids estimé dépasse la capacité du véhicule. */
    DEPASSEMENT,
    /** Le poids estimé n'est pas disponible dans la composition (donnée TMS absente). */
    POIDS_ABSENT
}
