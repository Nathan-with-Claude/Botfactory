package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper Infrastructure — Conversion entre TourneeEntity (JPA) et Tournee (Domain).
 * Protege le domaine de la structure de persistance.
 *
 * Regles :
 * - toDomain : entity → agregat domain
 * - toEntity : agregat domain → entity (pour sauvegarde)
 *
 * US-005 : mapping de motifNonLivraison et disposition sur ColisEntity ↔ Colis.
 */
@Component
public class TourneeMapper {

    public Tournee toDomain(TourneeEntity entity) {
        List<Colis> colisDomain = entity.getColis().stream()
                .map(this::colisToDomain)
                .toList();

        return new Tournee(
                new TourneeId(entity.getId()),
                new LivreurId(entity.getLivreurId()),
                entity.getDate(),
                colisDomain,
                entity.getStatut()
        );
    }

    public TourneeEntity toEntity(Tournee tournee) {
        TourneeEntity entity = new TourneeEntity(
                tournee.getId().value(),
                tournee.getLivreurId().value(),
                tournee.getDate(),
                tournee.getStatut()
        );

        List<ColisEntity> colisEntities = tournee.getColis().stream()
                .map(c -> colisToEntity(c, entity))
                .toList();
        entity.setColis(colisEntities);

        return entity;
    }

    /**
     * Met a jour le statut de la tournee et les statuts/motifs/dispositions de chaque colis.
     * Appele par TourneeRepositoryImpl.save() pour une tournee existante.
     */
    public void updateStatut(TourneeEntity entity, Tournee tournee) {
        entity.setStatut(tournee.getStatut());

        // US-005 : mettre a jour les statuts, motifs et dispositions de chaque colis
        for (Colis colis : tournee.getColis()) {
            entity.getColis().stream()
                    .filter(ce -> ce.getId().equals(colis.getId().value()))
                    .findFirst()
                    .ifPresent(ce -> {
                        ce.setStatut(colis.getStatut());
                        ce.setMotifNonLivraison(colis.getMotifNonLivraison());
                        ce.setDisposition(colis.getDisposition());
                    });
        }
    }

    // ─── Helpers prive ────────────────────────────────────────────────────────

    private Colis colisToDomain(ColisEntity colisEntity) {
        List<Contrainte> contraintes = colisEntity.getContraintes().stream()
                .map(c -> new Contrainte(c.getType(), c.getValeur()))
                .toList();

        return new Colis(
                new ColisId(colisEntity.getId()),
                new TourneeId(colisEntity.getTournee().getId()),
                colisEntity.getStatut(),
                new Adresse(
                        colisEntity.getAdresseRue(),
                        colisEntity.getAdresseComplement(),
                        colisEntity.getAdresseCodePostal(),
                        colisEntity.getAdresseVille(),
                        colisEntity.getAdresseZoneGeographique()
                ),
                new Destinataire(colisEntity.getDestinataireNom(), colisEntity.getDestinataireTeéléphone()),
                contraintes,
                colisEntity.getMotifNonLivraison(),
                colisEntity.getDisposition()
        );
    }

    private ColisEntity colisToEntity(Colis colis, TourneeEntity tourneeEntity) {
        ColisEntity colisEntity = new ColisEntity(
                colis.getId().value(),
                tourneeEntity,
                colis.getStatut(),
                colis.getAdresseLivraison().rue(),
                colis.getAdresseLivraison().complementAdresse(),
                colis.getAdresseLivraison().codePostal(),
                colis.getAdresseLivraison().ville(),
                colis.getAdresseLivraison().zoneGeographique(),
                colis.getDestinataire().nom(),
                colis.getDestinataire().telephoneChiffre()
        );

        colisEntity.setMotifNonLivraison(colis.getMotifNonLivraison());
        colisEntity.setDisposition(colis.getDisposition());

        List<ColisContrainteEmbeddable> contraintesEmb = colis.getContraintes().stream()
                .map(c -> new ColisContrainteEmbeddable(c.type(), c.valeur()))
                .toList();
        colisEntity.setContraintes(contraintesEmb);

        return colisEntity;
    }
}
