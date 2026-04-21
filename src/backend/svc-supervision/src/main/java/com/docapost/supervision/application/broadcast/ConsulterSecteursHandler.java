package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.BroadcastSecteur;
import com.docapost.supervision.domain.broadcast.repository.BroadcastSecteurRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ConsulterSecteursHandler — Application Service BC-03 / US-067
 *
 * Retourne la liste des secteurs broadcast actifs pour alimenter
 * l'interface superviseur (sélecteur de secteur lors de la composition d'un broadcast).
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Service
public class ConsulterSecteursHandler {

    private final BroadcastSecteurRepository broadcastSecteurRepository;

    public ConsulterSecteursHandler(BroadcastSecteurRepository broadcastSecteurRepository) {
        this.broadcastSecteurRepository = broadcastSecteurRepository;
    }

    /**
     * Retourne tous les secteurs avec actif = true.
     *
     * @return liste des BroadcastSecteur actifs
     */
    public List<BroadcastSecteur> handle() {
        return broadcastSecteurRepository.findAllActifs();
    }
}
