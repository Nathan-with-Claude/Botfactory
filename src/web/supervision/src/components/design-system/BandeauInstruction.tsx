/**
 * BandeauInstruction — Design System DocuPost (Web/Mobile)
 *
 * Overlay de notification d'instruction superviseur.
 * Source design-system.md §3.7.
 *
 * Usage (mobile overlay) :
 *   <BandeauInstruction
 *     instructionId="inst-001"
 *     texte="Prioriser le colis #00312"
 *     adresse="25 Rue Victor Hugo"
 *     countdownSecondes={10}
 *     onVoir={handleVoir}
 *     onOk={handleOk}
 *   />
 *
 * US-025 : Design System DocuPost.
 */

import React, { useEffect, useState } from 'react';
import './BandeauInstruction.css';

export interface BandeauInstructionProps {
  /** Identifiant de l'instruction */
  instructionId: string;
  /** Texte de l'instruction */
  texte: string;
  /** Adresse concernée (optionnelle) */
  adresse?: string;
  /** Durée du countdown en secondes (défaut : 10) */
  countdownSecondes?: number;
  /** Callback "VOIR" */
  onVoir: () => void;
  /** Callback "OK" (acquittement) */
  onOk: () => void;
}

/**
 * BandeauInstruction
 *
 * Structure :
 * ┌────────────────────────────────────────┐
 * │ [Bell] INSTRUCTION SUPERVISEUR         │  Fond --color-info-fonce, texte blanc
 * │  Prioriser le colis #00312             │  Texte instruction
 * │  25 Rue Victor Hugo                    │
 * │              [VOIR →]    [OK ✓]        │  2 boutons
 * │ ████████████████░░░  (countdown 10s)  │  Barre de décompte
 * └────────────────────────────────────────┘
 */
export function BandeauInstruction({
  texte,
  adresse,
  countdownSecondes = 10,
  onVoir,
  onOk,
}: BandeauInstructionProps): React.JSX.Element {
  const [secondesRestantes, setSecondesRestantes] = useState(countdownSecondes);

  useEffect(() => {
    if (secondesRestantes <= 0) return;
    const timer = setInterval(() => {
      setSecondesRestantes((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondesRestantes]);

  const pourcentageCountdown = (secondesRestantes / countdownSecondes) * 100;

  return (
    <div className="bandeau-instruction slide-down" data-testid="bandeau-instruction" role="alert" aria-live="assertive">
      {/* En-tête */}
      <div className="bandeau-instruction__entete">
        <span className="bandeau-instruction__icone" aria-hidden="true">🔔</span>
        <span className="bandeau-instruction__titre">INSTRUCTION SUPERVISEUR</span>
      </div>

      {/* Corps */}
      <div className="bandeau-instruction__corps">
        <p className="bandeau-instruction__texte" data-testid="bandeau-instruction-texte">{texte}</p>
        {adresse && (
          <p className="bandeau-instruction__adresse" data-testid="bandeau-instruction-adresse">{adresse}</p>
        )}
      </div>

      {/* Actions */}
      <div className="bandeau-instruction__actions">
        <button
          className="bandeau-instruction__btn bandeau-instruction__btn--voir"
          data-testid="bandeau-instruction-voir"
          onClick={onVoir}
          type="button"
        >
          VOIR →
        </button>
        <button
          className="bandeau-instruction__btn bandeau-instruction__btn--ok"
          data-testid="bandeau-instruction-ok"
          onClick={onOk}
          type="button"
        >
          OK ✓
        </button>
      </div>

      {/* Countdown */}
      <div
        className="bandeau-instruction__countdown-fond"
        role="progressbar"
        aria-valuenow={secondesRestantes}
        aria-valuemin={0}
        aria-valuemax={countdownSecondes}
        aria-label={`${secondesRestantes} secondes restantes`}
      >
        <div
          className="bandeau-instruction__countdown-barre"
          data-testid="bandeau-instruction-countdown"
          style={{ width: `${pourcentageCountdown}%` }}
        />
      </div>
    </div>
  );
}
