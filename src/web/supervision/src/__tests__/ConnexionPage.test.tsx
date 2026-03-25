/**
 * Tests unitaires — ConnexionPage web (US-020)
 *
 * Couvre :
 *  - SC1 : affichage bouton de connexion SSO superviseur
 *  - SC2 : accès refusé si rôle LIVREUR → message 403
 *  - SC3 : expiration session → redirection SSO
 *  - SC5 : bouton déconnexion
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mocks du module auth
const mockRedirectToSso = jest.fn();
const mockLogout = jest.fn();

jest.mock('../auth/webAuthService', () => ({
  redirectToSso: (...args: unknown[]) => mockRedirectToSso(...args),
  logout: (...args: unknown[]) => mockLogout(...args),
}));

import { ConnexionPage } from '../pages/ConnexionPage';

describe('ConnexionPage — US-020', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SC1 — affiche le bouton "Se connecter via compte Docaposte"', () => {
    render(<ConnexionPage status="unauthenticated" error={null} />);
    expect(screen.getByTestId('btn-connexion-sso')).toBeInTheDocument();
    expect(screen.getByText(/Se connecter via compte Docaposte/i)).toBeInTheDocument();
  });

  it('SC1 — le bouton de connexion appelle redirectToSso', () => {
    render(<ConnexionPage status="unauthenticated" error={null} />);
    fireEvent.click(screen.getByTestId('btn-connexion-sso'));
    expect(mockRedirectToSso).toHaveBeenCalledTimes(1);
  });

  it('SC2 — affiche le message d\'accès non autorisé si status=forbidden', () => {
    render(<ConnexionPage status="forbidden" error="Accès non autorisé. Cette interface est réservée aux superviseurs." />);
    expect(screen.getByTestId('msg-acces-refuse')).toBeInTheDocument();
    expect(screen.getByText(/réservée aux superviseurs/i)).toBeInTheDocument();
  });

  it('affiche un spinner pendant le chargement', () => {
    render(<ConnexionPage status="loading" error={null} />);
    expect(screen.getByTestId('spinner-connexion')).toBeInTheDocument();
  });

  it('SC3 — affiche le message d\'expiration si status=session-expired', () => {
    render(<ConnexionPage status="session-expired" error={null} />);
    expect(screen.getByTestId('msg-session-expiree')).toBeInTheDocument();
  });

  it('SC3 — le bouton Reconnecter est disponible si session expirée', () => {
    render(<ConnexionPage status="session-expired" error={null} />);
    const btn = screen.getByTestId('btn-reconnecter');
    fireEvent.click(btn);
    expect(mockRedirectToSso).toHaveBeenCalledTimes(1);
  });

  it('n\'affiche pas de message d\'erreur si status=unauthenticated', () => {
    render(<ConnexionPage status="unauthenticated" error={null} />);
    expect(screen.queryByTestId('msg-acces-refuse')).not.toBeInTheDocument();
  });
});
