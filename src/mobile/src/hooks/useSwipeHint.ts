/**
 * Hook useSwipeHint — US-045 : Hint visuel swipe pour nouveaux utilisateurs
 *
 * Gère l'affichage du hint "Glissez vers la gauche pour déclarer un problème"
 * visible uniquement pendant les SEUIL_HINT premières utilisations réussies du swipe.
 *
 * Comportement :
 * - Lit le compteur swipeHintCount dans AsyncStorage au montage
 * - Affiche le hint si compteur < SEUIL_HINT (3)
 * - Incrémente le compteur UNIQUEMENT quand incrementerSwipeReussi() est appelé
 *   (= quand le swipe atteint le seuil 80px et que M-05 s'ouvre)
 * - Fail-safe : si AsyncStorage indisponible → hint affiché par défaut (mieux trop que pas)
 *
 * Invariants :
 * - Le compteur n'est PAS incrémenté au simple chargement de la liste
 * - StatutInstruction.EXECUTEE reste inchangé (pas de lien avec ce hook)
 *
 * Source : US-045 — Hint visuel swipe pour nouveaux utilisateurs
 */

import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Seuil d'utilisations réussies au-delà duquel le hint disparaît */
export const SWIPE_HINT_SEUIL = 3;

/** Clé AsyncStorage pour le compteur de swipes réussis */
export const SWIPE_HINT_KEY = '@docupost/swipe_hint_count';

export interface UseSwipeHintResult {
  /** true si le hint doit être affiché sur les cartes A_LIVRER */
  afficherHint: boolean;
  /** Appeler quand un swipe réussi aboutit à l'ouverture de M-05 */
  incrementerSwipeReussi: () => Promise<void>;
}

export function useSwipeHint(): UseSwipeHintResult {
  const [afficherHint, setAfficherHint] = useState(true); // fail-safe : true par défaut

  useEffect(() => {
    const chargerCompteur = async () => {
      try {
        const valeurStr = await AsyncStorage.getItem(SWIPE_HINT_KEY);
        const compteur = valeurStr ? parseInt(valeurStr, 10) : 0;
        setAfficherHint(compteur < SWIPE_HINT_SEUIL);
      } catch {
        // AsyncStorage indisponible — fail-safe : hint affiché (ne pas masquer)
        setAfficherHint(true);
      }
    };

    chargerCompteur();
  }, []);

  const incrementerSwipeReussi = useCallback(async () => {
    try {
      const valeurStr = await AsyncStorage.getItem(SWIPE_HINT_KEY);
      const compteur = valeurStr ? parseInt(valeurStr, 10) : 0;
      const nouveauCompteur = compteur + 1;
      await AsyncStorage.setItem(SWIPE_HINT_KEY, String(nouveauCompteur));
      // Si on atteint le seuil, masquer le hint immédiatement
      if (nouveauCompteur >= SWIPE_HINT_SEUIL) {
        setAfficherHint(false);
      }
    } catch {
      // AsyncStorage indisponible — silencieux, le hint reste affiché
    }
  }, []);

  return { afficherHint, incrementerSwipeReussi };
}
