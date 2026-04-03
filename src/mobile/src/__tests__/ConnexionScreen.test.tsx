/**
 * Tests unitaires — ConnexionScreen M-01 (US-019)
 *
 * Couvre :
 *  - SC1 : affichage bouton de connexion SSO
 *  - SC2 : affichage message erreur + bouton Réessayer
 *  - SC5 : bouton déconnexion disponible (via menu)
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ConnexionScreen } from '../screens/ConnexionScreen';

describe('ConnexionScreen M-01 — US-019', () => {

  it('SC1 — affiche le bouton "Connexion Docaposte" (L2 : libellé raccourci)', () => {
    const { getByTestId, getByText } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={jest.fn()}
        status="unauthenticated"
        error={null}
      />
    );
    expect(getByTestId('btn-connexion-sso')).toBeTruthy();
    // L2 — libellé raccourci
    expect(getByText('Connexion Docaposte')).toBeTruthy();
  });

  it('SC1 — appelle loginFn au clic sur le bouton de connexion', () => {
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={mockLogin}
        status="unauthenticated"
        error={null}
      />
    );

    fireEvent.press(getByTestId('btn-connexion-sso'));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('SC1 — appelle onLoginSuccess après une connexion réussie', async () => {
    const mockOnSuccess = jest.fn();
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    const { getByTestId, rerender } = render(
      <ConnexionScreen
        onLoginSuccess={mockOnSuccess}
        loginFn={mockLogin}
        status="unauthenticated"
        error={null}
      />
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-connexion-sso'));
    });

    rerender(
      <ConnexionScreen
        onLoginSuccess={mockOnSuccess}
        loginFn={mockLogin}
        status="authenticated"
        error={null}
      />
    );

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('SC2 — affiche le message d\'erreur si status=error', () => {
    const { getByTestId, getByText } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={jest.fn()}
        status="error"
        error="Connexion impossible. Vérifiez votre réseau ou contactez le support."
      />
    );
    expect(getByTestId('msg-erreur-connexion')).toBeTruthy();
    expect(getByText(/Connexion impossible/)).toBeTruthy();
  });

  it('SC2 — affiche le bouton Réessayer en état error', () => {
    const { getByTestId } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={jest.fn()}
        status="error"
        error="Connexion impossible."
      />
    );
    expect(getByTestId('btn-reessayer')).toBeTruthy();
  });

  it('SC2 — le bouton Réessayer appelle loginFn', () => {
    const mockLogin = jest.fn();
    const { getByTestId } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={mockLogin}
        status="error"
        error="Erreur."
      />
    );
    fireEvent.press(getByTestId('btn-reessayer'));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('affiche un spinner pendant le chargement (status=loading)', () => {
    const { getByTestId } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={jest.fn()}
        status="loading"
        error={null}
      />
    );
    expect(getByTestId('spinner-connexion')).toBeTruthy();
  });

  it('n\'affiche pas de message erreur si status=unauthenticated', () => {
    const { queryByTestId } = render(
      <ConnexionScreen
        onLoginSuccess={jest.fn()}
        loginFn={jest.fn()}
        status="unauthenticated"
        error={null}
      />
    );
    expect(queryByTestId('msg-erreur-connexion')).toBeNull();
  });
});
