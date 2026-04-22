import React, { useState, useEffect, useCallback } from 'react';

// ─── Types publics (exports pour les tests) ───────────────────────────────────

export interface BroadcastSummaryDTO {
  broadcastMessageId: string;
  type: 'ALERTE' | 'INFO' | 'CONSIGNE';
  texte: string;
  horodatageEnvoi: string;
  nombreDestinataires: number;
  nombreVus: number;
}

export interface BroadcastStatutLivraisonDTO {
  livreurId: string;
  nomComplet: string;
  statut: 'VU' | 'ENVOYE';
  horodatageVu: string | null;
}

export interface BroadcastStatutUpdateDTO {
  broadcastMessageId: string;
  nombreVus: number;
  nombreTotal: number;
}

export interface SecteurDTO {
  codeSecteur: string;
  libelle: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PanneauBroadcastPageProps {
  apiBaseUrl?: string;
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
  /** Callback injecté par les tests pour simuler des messages WebSocket */
  onWsSubscribe?: (
    callback: (update: BroadcastStatutUpdateDTO) => void
  ) => void;
}

// ─── Config types broadcast ───────────────────────────────────────────────────

type TypeBroadcast = 'ALERTE' | 'INFO' | 'CONSIGNE';

interface TypeConfig {
  type: TypeBroadcast;
  libelle: string;
  classeActive: string;
  classeInactive: string;
  classeBadge: string;
}

const TYPES_BROADCAST: TypeConfig[] = [
  {
    type: 'ALERTE',
    libelle: 'ALERTE',
    classeActive: 'border-2 border-red-600 bg-red-50',
    classeInactive: 'border border-outline-variant bg-surface-container-lowest hover:bg-red-50',
    classeBadge: 'bg-red-100 text-red-700',
  },
  {
    type: 'INFO',
    libelle: 'INFO',
    classeActive: 'border-2 border-blue-600 bg-blue-50',
    classeInactive: 'border border-outline-variant bg-surface-container-lowest hover:bg-blue-50',
    classeBadge: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'CONSIGNE',
    libelle: 'CONSIGNE',
    classeActive: 'border-2 border-orange-500 bg-orange-50',
    classeInactive: 'border border-outline-variant bg-surface-container-lowest hover:bg-orange-50',
    classeBadge: 'bg-orange-100 text-orange-700',
  },
];

const BADGE_CLASSES: Record<TypeBroadcast, string> = {
  ALERTE: 'bg-red-100 text-red-700',
  INFO: 'bg-blue-100 text-blue-700',
  CONSIGNE: 'bg-orange-100 text-orange-700',
};

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formaterHeure(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function dateAujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * PanneauBroadcastPage — W-09 (US-069)
 *
 * Drawer superviseur avec deux sections :
 * 1. Formulaire de composition et envoi de broadcast
 * 2. Historique des broadcasts du jour avec compteurs "Vu par N / M livreurs"
 *
 * Mise à jour temps réel des compteurs via WebSocket STOMP ou callback de test.
 *
 * Source : US-067, US-069
 */
const PanneauBroadcastPage: React.FC<PanneauBroadcastPageProps> = ({
  apiBaseUrl = 'http://localhost:8082',
  fetchFn = fetch,
  onWsSubscribe,
}) => {
  // ── État formulaire ─────────────────────────────────────────────────────────
  const [typeSel, setTypeSel] = useState<TypeBroadcast | null>(null);
  const [ciblage, setCiblage] = useState<'TOUS' | string>('TOUS');
  const [secteurs, setSecteurs] = useState<SecteurDTO[]>([]);
  const [texte, setTexte] = useState('');
  const [envoiState, setEnvoiState] = useState<'idle' | 'loading' | 'succes' | 'erreur'>('idle');

  // ── État historique ─────────────────────────────────────────────────────────
  const [historique, setHistorique] = useState<BroadcastSummaryDTO[]>([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);
  const [detailOuvert, setDetailOuvert] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, BroadcastStatutLivraisonDTO[]>>({});
  const [detailLoading, setDetailLoading] = useState(false);

  const peutEnvoyer = typeSel !== null && texte.trim().length > 0 && envoiState !== 'loading';
  const texteDepasse = texte.length > 250;

  // ── Chargement des secteurs ─────────────────────────────────────────────────
  useEffect(() => {
    fetchFn(`${apiBaseUrl}/api/supervision/broadcast-secteurs`)
      .then((r) => r.json())
      .then((data: SecteurDTO[]) => setSecteurs(data))
      .catch(() => setSecteurs([]));
  }, [apiBaseUrl, fetchFn]);

  // ── Chargement de l'historique ──────────────────────────────────────────────
  const chargerHistorique = useCallback(() => {
    setHistoriqueLoading(true);
    fetchFn(`${apiBaseUrl}/api/supervision/broadcasts/du-jour?date=${dateAujourdhui()}`)
      .then((r) => r.json())
      .then((data: BroadcastSummaryDTO[]) => setHistorique(data))
      .catch(() => setHistorique([]))
      .finally(() => setHistoriqueLoading(false));
  }, [apiBaseUrl, fetchFn]);

  useEffect(() => {
    chargerHistorique();
  }, [chargerHistorique]);

  // ── WebSocket / callback de test ────────────────────────────────────────────
  const handleWsUpdate = useCallback((update: BroadcastStatutUpdateDTO) => {
    setHistorique((prev) =>
      prev.map((item) =>
        item.broadcastMessageId === update.broadcastMessageId
          ? { ...item, nombreVus: update.nombreVus, nombreDestinataires: update.nombreTotal }
          : item
      )
    );
  }, []);

  useEffect(() => {
    // Mode test : le parent injecte un callback pour simuler les WS
    if (onWsSubscribe) {
      onWsSubscribe(handleWsUpdate);
      return;
    }

    // Mode production : SockJS + STOMP
    let stompClient: import('@stomp/stompjs').Client | null = null;

    const connectWs = async () => {
      try {
        const { Client } = await import('@stomp/stompjs');
        const SockJS = (await import('sockjs-client')).default;

        stompClient = new Client({
          webSocketFactory: () => new SockJS(`${apiBaseUrl}/ws/supervision`),
          onConnect: () => {
            const topic = `/topic/supervision/broadcasts/${dateAujourdhui()}`;
            stompClient?.subscribe(topic, (msg) => {
              try {
                const update: BroadcastStatutUpdateDTO = JSON.parse(msg.body);
                handleWsUpdate(update);
              } catch {
                // message malformé — ignorer
              }
            });
          },
          reconnectDelay: 5000,
        });
        stompClient.activate();
      } catch {
        // SockJS non disponible — mode dégradé sans WS
      }
    };

    connectWs();

    return () => {
      stompClient?.deactivate();
    };
  }, [apiBaseUrl, handleWsUpdate, onWsSubscribe]);

  // ── Envoi du broadcast ──────────────────────────────────────────────────────
  const handleEnvoyer = async () => {
    if (!typeSel || !texte.trim()) return;
    setEnvoiState('loading');

    try {
      const body = {
        type: typeSel,
        texte: texte.trim(),
        ciblage: {
          type: ciblage === 'TOUS' ? 'TOUS' : 'SECTEUR',
          secteurs: ciblage !== 'TOUS' ? [ciblage] : [],
        },
      };

      const response = await fetchFn(`${apiBaseUrl}/api/supervision/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setEnvoiState('succes');
        setTexte('');
        setTypeSel(null);
        setCiblage('TOUS');
        chargerHistorique();
        // Auto-dismiss du toast après 3s
        setTimeout(() => setEnvoiState('idle'), 3000);
      } else {
        setEnvoiState('erreur');
      }
    } catch {
      setEnvoiState('erreur');
    }
  };

  // ── Chargement détail nominatif ─────────────────────────────────────────────
  const handleChevron = async (broadcastMessageId: string) => {
    if (detailOuvert === broadcastMessageId) {
      setDetailOuvert(null);
      return;
    }
    setDetailOuvert(broadcastMessageId);

    if (details[broadcastMessageId]) return; // déjà chargé

    setDetailLoading(true);
    try {
      const r = await fetchFn(
        `${apiBaseUrl}/api/supervision/broadcasts/${broadcastMessageId}/statuts`
      );
      const data: BroadcastStatutLivraisonDTO[] = await r.json();
      setDetails((prev) => ({ ...prev, [broadcastMessageId]: data }));
    } catch {
      // silence — l'UI gardera la section vide
    } finally {
      setDetailLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDU
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div
      data-testid="panneau-broadcast"
      className="flex flex-col gap-6 max-w-2xl"
    >
      {/* ── Section formulaire ──────────────────────────────────────────── */}
      <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-5 shadow-sm">
        <h2 className="text-lg font-semibold font-headline text-on-surface m-0">
          Envoyer un message broadcast
        </h2>

        {/* Toast succès */}
        {envoiState === 'succes' && (
          <div
            data-testid="toast-broadcast-succes"
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 bg-[#e8f5e9] text-[#2e7d32] px-4 py-3 rounded-xl font-bold text-sm"
          >
            <span className="material-symbols-outlined text-base leading-none">check_circle</span>
            <span>Message envoyé avec succès.</span>
          </div>
        )}

        {/* Sélecteur type */}
        <div>
          <p className="text-xs font-bold font-label text-outline uppercase tracking-widest mb-3 m-0">
            Type de message
          </p>
          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Type de broadcast">
            {TYPES_BROADCAST.map((cfg) => {
              const isActive = typeSel === cfg.type;
              return (
                <button
                  key={cfg.type}
                  data-testid={`btn-type-${cfg.type}`}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setTypeSel(cfg.type)}
                  className={[
                    'p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                    isActive ? cfg.classeActive : cfg.classeInactive,
                  ].join(' ')}
                >
                  {cfg.libelle}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sélecteur ciblage */}
        <div>
          <p className="text-xs font-bold font-label text-outline uppercase tracking-widest mb-2 m-0">
            Destinataires
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-on-surface">
              <input
                type="radio"
                name="ciblage"
                value="TOUS"
                checked={ciblage === 'TOUS'}
                onChange={() => setCiblage('TOUS')}
                className="accent-primary"
              />
              Tous les livreurs actifs
            </label>
            {secteurs.map((s) => (
              <label
                key={s.codeSecteur}
                className="flex items-center gap-2 cursor-pointer text-sm text-on-surface"
              >
                <input
                  type="radio"
                  name="ciblage"
                  value={s.codeSecteur}
                  checked={ciblage === s.codeSecteur}
                  onChange={() => setCiblage(s.codeSecteur)}
                  className="accent-primary"
                />
                {s.libelle}
              </label>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold font-label text-outline uppercase tracking-widest m-0">
              Message
            </p>
            <span
              data-testid="compteur-chars"
              className={`text-xs font-mono ${texteDepasse ? 'text-red-600 font-bold' : 'text-on-surface-variant'}`}
            >
              {texte.length}/280
            </span>
          </div>
          <textarea
            data-testid="textarea-broadcast"
            value={texte}
            onChange={(e) => setTexte(e.target.value.slice(0, 280))}
            maxLength={280}
            placeholder="Saisissez votre message pour les livreurs..."
            rows={4}
            className="w-full p-4 bg-surface-container-low border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Bouton envoyer */}
        <div className="flex justify-end">
          <button
            data-testid="btn-envoyer-broadcast"
            onClick={handleEnvoyer}
            disabled={!peutEnvoyer}
            className={[
              'px-6 py-2.5 text-sm font-bold uppercase tracking-wide rounded-lg transition-all',
              peutEnvoyer
                ? 'bg-primary text-on-primary shadow-md hover:shadow-lg active:scale-95 cursor-pointer'
                : 'bg-outline-variant text-on-surface-variant cursor-not-allowed',
            ].join(' ')}
          >
            {envoiState === 'loading' ? 'Envoi...' : 'ENVOYER'}
          </button>
        </div>
      </section>

      {/* ── Section historique ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold font-headline text-on-surface m-0">
          Historique du jour
        </h2>

        {historiqueLoading && (
          <p className="text-sm text-on-surface-variant">Chargement…</p>
        )}

        {!historiqueLoading && historique.length === 0 && (
          <p
            data-testid="historique-vide"
            className="text-sm text-on-surface-variant italic py-4 text-center"
          >
            Aucun message envoyé aujourd'hui.
          </p>
        )}

        {historique.map((item) => {
          const typeConfig = TYPES_BROADCAST.find((t) => t.type === item.type);
          const badgeClass = BADGE_CLASSES[item.type] ?? 'bg-gray-100 text-gray-700';
          const isDetailOuvert = detailOuvert === item.broadcastMessageId;

          return (
            <div
              key={item.broadcastMessageId}
              data-testid={`item-broadcast-${item.broadcastMessageId}`}
              className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden"
            >
              {/* Ligne principale */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Badge type */}
                <span
                  data-testid={`badge-${item.broadcastMessageId}`}
                  className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${badgeClass}`}
                >
                  {item.type}
                </span>

                {/* Heure */}
                <span className="text-xs text-on-surface-variant flex-shrink-0 w-12">
                  {formaterHeure(item.horodatageEnvoi)}
                </span>

                {/* Texte tronqué */}
                <span className="text-sm text-on-surface flex-1 truncate">
                  {item.texte}
                </span>

                {/* Compteur Vu par N / M */}
                <span
                  data-testid={`compteur-${item.broadcastMessageId}`}
                  className="text-xs text-on-surface-variant flex-shrink-0 whitespace-nowrap"
                >
                  Vu par {item.nombreVus} / {item.nombreDestinataires}
                </span>

                {/* Chevron */}
                <button
                  data-testid={`chevron-${item.broadcastMessageId}`}
                  onClick={() => handleChevron(item.broadcastMessageId)}
                  aria-expanded={isDetailOuvert}
                  aria-label={`Détail du broadcast ${item.type}`}
                  className="p-1 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg leading-none">
                    {isDetailOuvert ? 'expand_less' : 'chevron_right'}
                  </span>
                </button>
              </div>

              {/* Détail nominatif */}
              {isDetailOuvert && (
                <div
                  data-testid={`detail-statuts-${item.broadcastMessageId}`}
                  className="border-t border-outline-variant/20 px-4 py-3 bg-surface-container-low"
                >
                  {detailLoading && !details[item.broadcastMessageId] && (
                    <p className="text-xs text-on-surface-variant">Chargement…</p>
                  )}
                  {details[item.broadcastMessageId]?.map((statut) => (
                    <div
                      key={statut.livreurId}
                      data-testid={`statut-livreur-${statut.livreurId}`}
                      data-statut={statut.statut}
                      className={[
                        'flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0',
                        statut.statut === 'VU' ? '' : 'opacity-60',
                      ].join(' ')}
                    >
                      <span className="text-sm font-medium text-on-surface">
                        {statut.nomComplet}
                      </span>
                      <div className="flex items-center gap-2">
                        {statut.statut === 'VU' ? (
                          <>
                            <span className="material-symbols-outlined text-base text-[#2e7d32] leading-none">
                              done_all
                            </span>
                            <span className="text-xs text-[#2e7d32] font-medium">
                              VU {statut.horodatageVu ? formaterHeure(statut.horodatageVu) : ''}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-on-surface-variant">EN ATTENTE</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default PanneauBroadcastPage;
