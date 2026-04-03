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

/**
 * Composant — PanneauInstructionPage (US-014)
 *
 * Panneau modal W-03 : envoi d'une instruction structurée à un livreur.
 * - Sélecteur type : PRIORISER | ANNULER | REPROGRAMMER
 * - Champs créneau cible (date + heure) si REPROGRAMMER — obligatoires
 * - Bouton ENVOYER désactivé si REPROGRAMMER sans créneau valide
 * - Toast de confirmation après succès
 * - Message d'erreur si 409 (instruction déjà en attente)
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
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

  const libelleType: Record<TypeInstruction, string> = {
    PRIORISER: 'Prioriser ce colis',
    ANNULER: 'Annuler la tentative',
    REPROGRAMMER: 'Reprogrammer la livraison',
  };

  return (
    <div
      data-testid="panneau-instruction"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 32,
          minWidth: 400,
          maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* Titre */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Envoyer une instruction</h2>
          {onFermer && (
            <button
              data-testid="btn-fermer"
              onClick={onFermer}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#555' }}
            >
              ×
            </button>
          )}
        </div>

        {/* Contexte */}
        <p style={{ color: '#555', marginBottom: 20 }}>
          Colis : <strong>{colisId}</strong>
          {livreurNom && <> — Livreur : <strong>{livreurNom}</strong></>}
        </p>

        {/* Toast succès — Bloquant 4 : mention livreur + "notifié" + accessibilité */}
        {envoi === 'succes' && (
          <div
            data-testid="toast-succes"
            role="status"
            aria-live="polite"
            style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '10px 16px',
              borderRadius: 4,
              marginBottom: 16,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>✓</span>
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
            style={{
              background: '#fdecea',
              color: '#c62828',
              padding: '10px 16px',
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            {messageErreur}
          </div>
        )}

        {/* Sélecteur type */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Type d'instruction
          </label>
          {(['PRIORISER', 'ANNULER', 'REPROGRAMMER'] as TypeInstruction[]).map((t) => (
            <label
              key={t}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}
            >
              <input
                type="radio"
                data-testid={`radio-${t.toLowerCase()}`}
                name="typeInstruction"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
              />
              {libelleType[t]}
            </label>
          ))}
        </div>

        {/* Créneau cible (REPROGRAMMER uniquement) */}
        {type === 'REPROGRAMMER' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#e65100' }}>
              Créneau cible (obligatoire)
            </label>
            {!creneauValide && (
              <p data-testid="message-creneau-requis" style={{ color: '#c62828', fontSize: 13, margin: '0 0 8px' }}>
                Veuillez renseigner la date et l'heure cibles pour reprogrammer.
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="date"
                data-testid="input-date-cible"
                value={dateCible}
                onChange={(e) => setDateCible(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
              <input
                type="time"
                data-testid="input-heure-cible"
                value={heureCible}
                onChange={(e) => setHeureCible(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }}
              />
            </div>
          </div>
        )}

        {/* Bouton ENVOYER */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {onFermer && (
            <button
              onClick={onFermer}
              style={{
                padding: '8px 20px',
                background: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          )}
          <button
            data-testid="btn-envoyer"
            onClick={handleEnvoyer}
            disabled={!peutEnvoyer}
            style={{
              padding: '8px 20px',
              background: peutEnvoyer ? '#1976d2' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: peutEnvoyer ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
          >
            {envoi === 'loading' ? 'Envoi...' : 'ENVOYER'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanneauInstructionPage;
