import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TypeInstruction = 'PRIORISER' | 'ANNULER' | 'REPROGRAMMER';

export interface InstructionCreeDTO {
  instructionId: string;
  colisId: string;
  typeInstruction: TypeInstruction;
  statut: string;
  horodatage: string;
}

interface PanneauInstructionPageProps {
  tourneeId: string;
  colisId: string;
  livreurNom?: string;
  onEnvoye?: (instruction: InstructionCreeDTO) => void;
  onFermer?: () => void;
  apiBaseUrl?: string;
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
}

// ─── Config cards type d'instruction ─────────────────────────────────────────

interface CardTypeConfig {
  type: TypeInstruction;
  testId: string;
  icone: string;
  libelle: string;
  description: string;
}

const CARDS_TYPE: CardTypeConfig[] = [
  {
    type: 'PRIORISER',
    testId: 'radio-prioriser',
    icone: 'arrow_upward',
    libelle: 'PRIORISER',
    description: 'Prioriser ce colis',
  },
  {
    type: 'ANNULER',
    testId: 'radio-annuler',
    icone: 'close',
    libelle: 'ANNULER',
    description: 'Annuler la tentative',
  },
  {
    type: 'REPROGRAMMER',
    testId: 'radio-reprogrammer',
    icone: 'refresh',
    libelle: 'REPROGRAMMER',
    description: 'Reprogrammer la livraison',
  },
];

/**
 * Composant — PanneauInstructionPage (US-014)
 *
 * Panneau modal W-03 : envoi d'une instruction structurée à un livreur.
 * - Sélecteur type : PRIORISER | ANNULER | REPROGRAMMER (grid cards)
 * - Champs créneau cible (date + heure) si REPROGRAMMER — obligatoires
 * - Textarea message complémentaire optionnel (200 chars max)
 * - Bouton ENVOYER désactivé si REPROGRAMMER sans créneau valide
 * - Toast de confirmation après succès
 * - Message d'erreur si 409 (instruction déjà en attente)
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 *          US-063 — Conformité design W-03
 */
const PanneauInstructionPage: React.FC<PanneauInstructionPageProps> = ({
  tourneeId,
  colisId,
  livreurNom,
  onEnvoye,
  onFermer,
  apiBaseUrl = 'http://localhost:8082',
  fetchFn = fetch,
}) => {
  const [type, setType] = useState<TypeInstruction>('PRIORISER');
  const [dateCible, setDateCible] = useState('');
  const [heureCible, setHeureCible] = useState('');
  const [messageComplementaire, setMessageComplementaire] = useState('');
  const [envoi, setEnvoi] = useState<'idle' | 'loading' | 'succes' | 'erreur'>('idle');
  const [messageErreur, setMessageErreur] = useState<string | null>(null);

  // REPROGRAMMER requiert date + heure cibles
  const creneauValide = type !== 'REPROGRAMMER' || (dateCible.length > 0 && heureCible.length > 0);
  // Bloquant 4 — désactivé aussi après succès pour éviter les doublons
  const peutEnvoyer = creneauValide && envoi !== 'loading' && envoi !== 'succes';

  const creneauCibleISO = type === 'REPROGRAMMER' && dateCible && heureCible
    ? new Date(`${dateCible}T${heureCible}:00`).toISOString()
    : undefined;

  const handleEnvoyer = async () => {
    setEnvoi('loading');
    setMessageErreur(null);

    try {
      const body: Record<string, unknown> = {
        tourneeId,
        colisId,
        typeInstruction: type,
      };
      if (creneauCibleISO) {
        body.creneauCible = creneauCibleISO;
      }
      if (messageComplementaire.trim().length > 0) {
        body.messageComplementaire = messageComplementaire.trim();
      }

      const response = await fetchFn(`${apiBaseUrl}/api/supervision/instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.status === 409) {
        setMessageErreur(
          'Une instruction est en attente d\'exécution. Attendez la confirmation du livreur.'
        );
        setEnvoi('erreur');
        return;
      }

      if (response.status === 422) {
        setMessageErreur('Veuillez renseigner la date et l\'heure cibles pour reprogrammer.');
        setEnvoi('erreur');
        return;
      }

      if (!response.ok) {
        setMessageErreur(`Erreur serveur (${response.status}).`);
        setEnvoi('erreur');
        return;
      }

      const instruction: InstructionCreeDTO = await response.json();
      setEnvoi('succes');
      onEnvoye?.(instruction);
    } catch {
      setMessageErreur('Impossible de contacter le serveur.');
      setEnvoi('erreur');
    }
  };

  return (
    /* Overlay glass W-03 */
    <div
      data-testid="panneau-instruction"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 glass-overlay"
    >
      {/* Modal container */}
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-xl modal-shadow overflow-hidden flex flex-col">

        {/* Header modal */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-2xl font-semibold font-headline text-on-surface tracking-tight m-0">
              Envoyer une instruction
            </h2>
            {onFermer && (
              <button
                data-testid="btn-fermer"
                onClick={onFermer}
                className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined text-xl leading-none">close</span>
              </button>
            )}
          </div>
          {/* Sous-titre */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-primary">{tourneeId}</span>
            {livreurNom && (
              <span className="text-sm text-on-surface-variant">— {livreurNom}</span>
            )}
          </div>
        </div>

        {/* Body modal */}
        <div className="px-8 pb-6 flex flex-col gap-6">

          {/* Toast succès — Bloquant 4 */}
          {envoi === 'succes' && (
            <div
              data-testid="toast-succes"
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 bg-[#e8f5e9] text-[#2e7d32] px-4 py-3 rounded-xl font-bold text-sm"
            >
              <span className="material-symbols-outlined text-base leading-none">check_circle</span>
              <span>
                Instruction envoyée{livreurNom ? ` à ${livreurNom}` : ''}.{' '}
                Le livreur a été notifié.
              </span>
            </div>
          )}

          {/* Erreur */}
          {messageErreur && (
            <div
              data-testid="message-erreur"
              className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm"
            >
              {messageErreur}
            </div>
          )}

          {/* Parcel Card */}
          <div className="bg-surface-container-low p-5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant">package_2</span>
              </div>
              <div>
                <p className="text-xs font-bold font-label text-outline uppercase tracking-wider m-0">
                  Colis
                </p>
                <p className="text-sm font-semibold text-on-surface m-0">{colisId}</p>
              </div>
            </div>
          </div>

          {/* Sélecteur type d'instruction — grid cards */}
          <div>
            <p className="text-xs font-bold font-label text-outline uppercase tracking-widest mb-3 m-0">
              Type d'instruction
            </p>
            <div
              className="grid grid-cols-3 gap-3"
              role="radiogroup"
              aria-label="Type d'instruction"
            >
              {CARDS_TYPE.map((card) => {
                const isActive = type === card.type;
                return (
                  <div
                    key={card.type}
                    data-testid={card.testId}
                    role="radio"
                    aria-checked={isActive}
                    tabIndex={0}
                    onClick={() => setType(card.type)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setType(card.type);
                      }
                    }}
                    className={[
                      'p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none',
                      isActive
                        ? 'border-2 border-primary bg-primary/[0.03]'
                        : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isActive
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant',
                      ].join(' ')}
                    >
                      <span className="material-symbols-outlined text-xl leading-none">
                        {card.icone}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-outline font-label uppercase tracking-widest text-center">
                      {card.libelle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Créneau cible (REPROGRAMMER uniquement) */}
          {type === 'REPROGRAMMER' && (
            <div>
              <p className="text-xs font-bold font-label text-primary uppercase tracking-widest mb-2 m-0">
                Créneau cible (obligatoire)
              </p>
              {!creneauValide && (
                <p
                  data-testid="message-creneau-requis"
                  className="text-error text-xs mb-2 m-0"
                >
                  Veuillez renseigner la date et l'heure cibles pour reprogrammer.
                </p>
              )}
              <div className="flex gap-3">
                <input
                  type="date"
                  data-testid="input-date-cible"
                  value={dateCible}
                  onChange={(e) => setDateCible(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="time"
                  data-testid="input-heure-cible"
                  value={heureCible}
                  onChange={(e) => setHeureCible(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Textarea message complémentaire (optionnel) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-bold font-label text-outline uppercase tracking-widest m-0">
                Message complémentaire
              </p>
              <span className="text-xs text-on-surface-variant">
                {messageComplementaire.length} / 200
              </span>
            </div>
            <textarea
              data-testid="textarea-message"
              value={messageComplementaire}
              onChange={(e) => setMessageComplementaire(e.target.value.slice(0, 200))}
              maxLength={200}
              placeholder="Ajouter une précision pour le livreur..."
              className="w-full h-24 p-4 bg-surface-container-low border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>

          {/* Bandeau "Livreur en ligne" */}
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary-fixed/30 rounded-lg">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <p className="text-xs text-on-surface-variant m-0">
              Livreur en ligne — L'instruction sera transmise instantanément.
            </p>
          </div>
        </div>

        {/* Footer modal */}
        <div className="px-8 py-6 bg-surface-container-low flex justify-end gap-3 mt-auto">
          {onFermer && (
            <button
              onClick={onFermer}
              className="px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            data-testid="btn-envoyer"
            onClick={handleEnvoyer}
            disabled={!peutEnvoyer}
            className={[
              'px-6 py-2.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all',
              peutEnvoyer
                ? 'bg-primary text-on-primary shadow-md hover:shadow-lg active:scale-95 cursor-pointer'
                : 'bg-outline-variant text-on-surface-variant cursor-not-allowed',
            ].join(' ')}
          >
            {envoi === 'loading' ? 'Envoi...' : 'ENVOYER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanneauInstructionPage;
