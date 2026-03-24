import React, { useState } from 'react';

/**
 * Types — PreuveDetailDTO (US-010)
 * Correspond au contrat de l'API GET /api/preuves/livraison/{colisId}
 */
export interface CoordonneesGpsDTO {
  latitude: number;
  longitude: number;
}

export interface PreuveDetailDTO {
  preuveLivraisonId: string;
  colisId: string;
  typePreuve: 'SIGNATURE' | 'PHOTO' | 'TIERS_IDENTIFIE' | 'DEPOT_SECURISE';
  horodatage: string; // ISO-8601
  modeDegradeGps: boolean;
  coordonneesGps?: CoordonneesGpsDTO;
  aperçuSignature?: string; // Base64
  urlPhoto?: string;
  hashIntegrite?: string;
  nomTiers?: string;
  descriptionDepot?: string;
}

/**
 * Composant — ConsulterPreuvePage (US-010)
 *
 * Écran de consultation de la preuve d'une livraison pour traitement d'un litige.
 * Accessible aux rôles SUPERVISEUR et SUPPORT uniquement.
 *
 * Fonctionnement :
 * 1. Saisir un colisId dans le champ de recherche
 * 2. Appeler GET /api/preuves/livraison/{colisId}
 * 3. Afficher les métadonnées de la preuve
 *
 * Source : US-010 — "Consulter la preuve d'une livraison pour traiter un litige"
 */

interface ConsulterPreuvePageProps {
  apiBaseUrl?: string;
  fetchFn?: (url: string) => Promise<Response>; // injectable pour les tests
}

const ConsulterPreuvePage: React.FC<ConsulterPreuvePageProps> = ({
  apiBaseUrl = 'http://localhost:8081',
  fetchFn = fetch,
}) => {
  const [colisIdInput, setColisIdInput] = useState('');
  const [preuve, setPreuve] = useState<PreuveDetailDTO | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const rechercherPreuve = async () => {
    const colisId = colisIdInput.trim();
    if (!colisId) {
      setErreur('Veuillez saisir un identifiant de colis.');
      return;
    }

    setChargement(true);
    setErreur(null);
    setPreuve(null);

    try {
      const response = await fetchFn(
        `${apiBaseUrl}/api/preuves/livraison/${encodeURIComponent(colisId)}`
      );

      if (response.status === 403) {
        setErreur('Accès refusé : vous n\'avez pas les droits pour consulter les preuves.');
        return;
      }
      if (response.status === 404) {
        setErreur(`Aucune preuve trouvée pour le colis "${colisId}".`);
        return;
      }
      if (!response.ok) {
        setErreur(`Erreur serveur (${response.status}). Veuillez réessayer.`);
        return;
      }

      const data: PreuveDetailDTO = await response.json();
      setPreuve(data);
    } catch {
      setErreur('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setChargement(false);
    }
  };

  const libellType: Record<string, string> = {
    SIGNATURE: 'Signature numérique',
    PHOTO: 'Photo du colis',
    TIERS_IDENTIFIE: 'Tiers identifié',
    DEPOT_SECURISE: 'Dépôt sécurisé',
  };

  return (
    <div data-testid="consulter-preuve-page" style={{ fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Consulter une preuve de livraison</h1>
      <p style={{ color: '#555' }}>Saisissez l'identifiant du colis pour accéder à la preuve de livraison associée.</p>

      {/* Zone de recherche */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          data-testid="input-colis-id"
          type="text"
          placeholder="Identifiant du colis (ex : colis-001)"
          value={colisIdInput}
          onChange={(e) => setColisIdInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && rechercherPreuve()}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button
          data-testid="btn-rechercher"
          onClick={rechercherPreuve}
          disabled={chargement}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: chargement ? 'not-allowed' : 'pointer',
          }}
        >
          {chargement ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {/* Message d'erreur */}
      {erreur && (
        <div
          data-testid="message-erreur"
          style={{ background: '#fdecea', color: '#c62828', padding: 12, borderRadius: 4, marginBottom: 16 }}
        >
          {erreur}
        </div>
      )}

      {/* Résultat : métadonnées de la preuve */}
      {preuve && (
        <div
          data-testid="preuve-detail"
          style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 24 }}
        >
          <h2 style={{ marginTop: 0 }}>Preuve de livraison</h2>

          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                <td style={labelStyle}>Identifiant preuve</td>
                <td data-testid="preuve-id">{preuve.preuveLivraisonId}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Colis</td>
                <td data-testid="preuve-colis-id">{preuve.colisId}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Type de preuve</td>
                <td data-testid="preuve-type">
                  <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {libellType[preuve.typePreuve] ?? preuve.typePreuve}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>Horodatage</td>
                <td data-testid="preuve-horodatage">
                  {new Date(preuve.horodatage).toLocaleString('fr-FR')}
                </td>
              </tr>
              <tr>
                <td style={labelStyle}>GPS</td>
                <td data-testid="preuve-gps">
                  {preuve.modeDegradeGps
                    ? 'Mode dégradé (GPS indisponible)'
                    : preuve.coordonneesGps
                    ? `${preuve.coordonneesGps.latitude}, ${preuve.coordonneesGps.longitude}`
                    : '—'}
                </td>
              </tr>

              {/* Champs conditionnels selon le type */}
              {preuve.aperçuSignature && (
                <tr>
                  <td style={labelStyle}>Aperçu signature</td>
                  <td>
                    <img
                      data-testid="preuve-signature-img"
                      src={`data:image/png;base64,${preuve.aperçuSignature}`}
                      alt="Aperçu de la signature"
                      style={{ maxWidth: 300, border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>
              )}
              {preuve.urlPhoto && (
                <tr>
                  <td style={labelStyle}>Photo</td>
                  <td>
                    <a
                      data-testid="preuve-url-photo"
                      href={preuve.urlPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {preuve.urlPhoto}
                    </a>
                    {preuve.hashIntegrite && (
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        Hash : {preuve.hashIntegrite}
                      </div>
                    )}
                  </td>
                </tr>
              )}
              {preuve.nomTiers && (
                <tr>
                  <td style={labelStyle}>Tiers identifié</td>
                  <td data-testid="preuve-nom-tiers">{preuve.nomTiers}</td>
                </tr>
              )}
              {preuve.descriptionDepot && (
                <tr>
                  <td style={labelStyle}>Dépôt sécurisé</td>
                  <td data-testid="preuve-description-depot">{preuve.descriptionDepot}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#555',
  padding: '6px 16px 6px 0',
  whiteSpace: 'nowrap',
  verticalAlign: 'top',
};

export default ConsulterPreuvePage;
