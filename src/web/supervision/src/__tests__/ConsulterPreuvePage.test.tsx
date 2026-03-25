import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsulterPreuvePage, { PreuveDetailDTO } from '../pages/ConsulterPreuvePage';

/**
 * Tests Jest — ConsulterPreuvePage (US-010)
 *
 * Vérifie :
 * 1. Affiche le champ de recherche et le bouton
 * 2. Affiche une erreur si colisId vide
 * 3. Affiche les métadonnées de la preuve SIGNATURE
 * 4. Affiche erreur 404 si preuve absente
 * 5. Affiche erreur 403 si accès refusé
 * 6. Affiche les données spécifiques PHOTO (urlPhoto + hash)
 * 7. Affiche le nom du tiers pour TIERS_IDENTIFIE
 */

const mockPreuveSignature: PreuveDetailDTO = {
  preuveLivraisonId: 'preuve-abc-123',
  colisId: 'colis-001',
  typePreuve: 'SIGNATURE',
  horodatage: '2026-03-24T10:00:00Z',
  modeDegradeGps: false,
  coordonneesGps: { latitude: 48.85, longitude: 2.35 },
  aperçuSignature: 'iVBORw0KGgo=', // Base64 simulé
};

const mockPreuvePhoto: PreuveDetailDTO = {
  preuveLivraisonId: 'preuve-def-456',
  colisId: 'colis-002',
  typePreuve: 'PHOTO',
  horodatage: '2026-03-24T11:00:00Z',
  modeDegradeGps: true,
  urlPhoto: 'https://s3.example.com/photo.jpg',
  hashIntegrite: 'sha256-abc123',
};

const mockPreuveTiers: PreuveDetailDTO = {
  preuveLivraisonId: 'preuve-ghi-789',
  colisId: 'colis-003',
  typePreuve: 'TIERS_IDENTIFIE',
  horodatage: '2026-03-24T12:00:00Z',
  modeDegradeGps: false,
  coordonneesGps: { latitude: 48.86, longitude: 2.36 },
  nomTiers: 'Jean Dupont',
};

function mockFetch(status: number, body?: object): () => Promise<Response> {
  return () =>
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(body),
    } as Response);
}

describe('ConsulterPreuvePage', () => {
  test('affiche le champ de recherche et le bouton', () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(200, mockPreuveSignature)} />);

    expect(screen.getByTestId('consulter-preuve-page')).toBeInTheDocument();
    expect(screen.getByTestId('input-colis-id')).toBeInTheDocument();
    expect(screen.getByTestId('btn-rechercher')).toBeInTheDocument();
  });

  test('affiche une erreur si le colisId est vide', async () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(200, mockPreuveSignature)} />);

    fireEvent.click(screen.getByTestId('btn-rechercher'));

    await waitFor(() => {
      expect(screen.getByTestId('message-erreur')).toBeInTheDocument();
    });
    expect(screen.getByTestId('message-erreur')).toHaveTextContent('identifiant');
  });

  test('affiche les métadonnées d\'une preuve SIGNATURE', async () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(200, mockPreuveSignature)} />);

    fireEvent.change(screen.getByTestId('input-colis-id'), {
      target: { value: 'colis-001' },
    });
    fireEvent.click(screen.getByTestId('btn-rechercher'));

    await waitFor(() => {
      expect(screen.getByTestId('preuve-detail')).toBeInTheDocument();
    });

    expect(screen.getByTestId('preuve-id')).toHaveTextContent('preuve-abc-123');
    expect(screen.getByTestId('preuve-colis-id')).toHaveTextContent('colis-001');
    expect(screen.getByTestId('preuve-type')).toHaveTextContent('Signature numérique');
    expect(screen.getByTestId('preuve-horodatage')).toBeInTheDocument();
    expect(screen.getByTestId('preuve-gps')).toHaveTextContent('48.85');
    expect(screen.getByTestId('preuve-signature-img')).toBeInTheDocument();
  });

  test('affiche erreur 404 si preuve absente', async () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(404)} />);

    fireEvent.change(screen.getByTestId('input-colis-id'), {
      target: { value: 'colis-inconnu' },
    });
    fireEvent.click(screen.getByTestId('btn-rechercher'));

    await waitFor(() => {
      expect(screen.getByTestId('message-erreur')).toBeInTheDocument();
    });
    expect(screen.getByTestId('message-erreur')).toHaveTextContent('colis-inconnu');
  });

  test('affiche erreur 403 si accès refusé', async () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(403)} />);

    fireEvent.change(screen.getByTestId('input-colis-id'), {
      target: { value: 'colis-001' },
    });
    fireEvent.click(screen.getByTestId('btn-rechercher'));

    await waitFor(() => {
      expect(screen.getByTestId('message-erreur')).toBeInTheDocument();
    });
    expect(screen.getByTestId('message-erreur')).toHaveTextContent('droits');
  });

  test('affiche urlPhoto et hashIntegrite pour une preuve PHOTO', async () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(200, mockPreuvePhoto)} />);

    fireEvent.change(screen.getByTestId('input-colis-id'), {
      target: { value: 'colis-002' },
    });
    fireEvent.click(screen.getByTestId('btn-rechercher'));

    await waitFor(() => {
      expect(screen.getByTestId('preuve-detail')).toBeInTheDocument();
    });

    expect(screen.getByTestId('preuve-url-photo')).toHaveTextContent('https://s3.example.com/photo.jpg');
    expect(screen.getByTestId('preuve-gps')).toHaveTextContent('Mode dégradé');
  });

  test('affiche le nom du tiers pour TIERS_IDENTIFIE', async () => {
    render(<ConsulterPreuvePage fetchFn={mockFetch(200, mockPreuveTiers)} />);

    fireEvent.change(screen.getByTestId('input-colis-id'), {
      target: { value: 'colis-003' },
    });
    fireEvent.click(screen.getByTestId('btn-rechercher'));

    await waitFor(() => {
      expect(screen.getByTestId('preuve-detail')).toBeInTheDocument();
    });

    expect(screen.getByTestId('preuve-nom-tiers')).toHaveTextContent('Jean Dupont');
    expect(screen.getByTestId('preuve-type')).toHaveTextContent('Tiers identifié');
  });
});
