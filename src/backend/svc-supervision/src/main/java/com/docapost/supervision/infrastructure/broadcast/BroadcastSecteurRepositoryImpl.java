package com.docapost.supervision.infrastructure.broadcast;

import com.docapost.supervision.domain.broadcast.BroadcastSecteur;
import com.docapost.supervision.domain.broadcast.repository.BroadcastSecteurRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * BroadcastSecteurRepositoryImpl — Implémentation Infrastructure BC-03 / US-067
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Repository
public class BroadcastSecteurRepositoryImpl implements BroadcastSecteurRepository {

    private final BroadcastSecteurJpaRepository jpa;

    public BroadcastSecteurRepositoryImpl(BroadcastSecteurJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<BroadcastSecteur> findAllActifs() {
        return jpa.findByActifTrue().stream()
                .map(e -> new BroadcastSecteur(e.getCodeSecteur(), e.getLibelle(), e.isActif(), List.of()))
                .toList();
    }
}
