/**
 * Tests TDD — TopAppBar (US-025 SC8)
 *
 * Couvre :
 * - SC8.1 : data-testid="top-app-bar" présent
 * - SC8.2 : logo "DocuPost" visible en position fixe
 * - SC8.3 : IndicateurSync visible à droite
 * - SC8.4 : profil utilisateur visible
 * - SC8.5 : onglet actif vs inactif selon activePage
 * - SC8.6 : callback navigation déclenché au clic
 * - SC8.7 : syncStatus transmis à l'IndicateurSync
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopAppBar } from '../components/layout/TopAppBar';

describe('TopAppBar — US-025 SC8', () => {
  it('SC8.1 — rendu avec data-testid="top-app-bar"', () => {
    render(<TopAppBar />);
    expect(screen.getByTestId('top-app-bar')).toBeTruthy();
  });

  it('SC8.2 — logo "DocuPost" visible', () => {
    render(<TopAppBar />);
    expect(screen.getByTestId('top-app-bar-logo')).toHaveTextContent('DocuPost');
  });

  it('SC8.3 — IndicateurSync visible à droite', () => {
    render(<TopAppBar syncStatus="live" />);
    const badge = screen.getByTestId('top-app-bar-indicateur-sync');
    expect(badge).toBeTruthy();
    expect(badge).toHaveTextContent('LIVE');
  });

  it('SC8.3 — IndicateurSync affiche OFFLINE quand syncStatus="offline"', () => {
    render(<TopAppBar syncStatus="offline" />);
    expect(screen.getByTestId('top-app-bar-indicateur-sync')).toHaveTextContent('OFFLINE');
  });

  it('SC8.3 — IndicateurSync affiche POLLING quand syncStatus="polling"', () => {
    render(<TopAppBar syncStatus="polling" />);
    expect(screen.getByTestId('top-app-bar-indicateur-sync')).toHaveTextContent('POLLING');
  });

  it('SC8.4 — profil utilisateur visible avec nom', () => {
    render(<TopAppBar userName="Laurent Renaud" />);
    expect(screen.getByTestId('top-app-bar-profil')).toBeTruthy();
    expect(screen.getByTestId('top-app-bar-profil-nom')).toHaveTextContent('Laurent Renaud');
  });

  it('SC8.4 — avatar affiche les initiales', () => {
    render(<TopAppBar userName="Laurent Renaud" />);
    expect(screen.getByTestId('top-app-bar-profil-avatar')).toHaveTextContent('LR');
  });

  it('SC8.5 — onglet "Plan du jour" actif quand activePage="preparation"', () => {
    render(<TopAppBar activePage="preparation" />);
    const btn = screen.getByTestId('top-app-bar-nav-preparation');
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('SC8.5 — onglet "Historique" inactif quand activePage="preparation"', () => {
    render(<TopAppBar activePage="preparation" />);
    const btn = screen.getByTestId('top-app-bar-nav-supervision');
    expect(btn).not.toHaveAttribute('aria-current', 'page');
  });

  it('SC8.5 — onglet "Historique" actif quand activePage="supervision"', () => {
    render(<TopAppBar activePage="supervision" />);
    const btn = screen.getByTestId('top-app-bar-nav-supervision');
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('SC8.6 — onNavigatePreparation appelé au clic sur "Plan du jour"', () => {
    const mockNav = jest.fn();
    render(<TopAppBar onNavigatePreparation={mockNav} />);
    fireEvent.click(screen.getByTestId('top-app-bar-nav-preparation'));
    expect(mockNav).toHaveBeenCalledTimes(1);
  });

  it('SC8.6 — onNavigateSupervision appelé au clic sur "Historique"', () => {
    const mockNav = jest.fn();
    render(<TopAppBar onNavigateSupervision={mockNav} />);
    fireEvent.click(screen.getByTestId('top-app-bar-nav-supervision'));
    expect(mockNav).toHaveBeenCalledTimes(1);
  });

  it('SC8 — boutons sync et notifications présents', () => {
    render(<TopAppBar />);
    expect(screen.getByTestId('top-app-bar-btn-sync')).toBeTruthy();
    expect(screen.getByTestId('top-app-bar-btn-notifications')).toBeTruthy();
  });
});
