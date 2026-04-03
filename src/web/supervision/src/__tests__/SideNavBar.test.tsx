/**
 * Tests TDD — SideNavBar (US-025 SC9)
 *
 * Couvre :
 * - SC9.1 : data-testid="side-nav-bar" présent
 * - SC9.2 : item "Préparation" actif selon la route
 * - SC9.3 : item "Supervision" actif selon la route
 * - SC9.4 : item inactif n'a pas aria-current="page"
 * - SC9.5 : callbacks navigation déclenchés au clic
 * - SC9.6 : liens Aide et Déconnexion présents en bas
 * - SC9.7 : callback déconnexion déclenché au clic
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SideNavBar } from '../components/layout/SideNavBar';

describe('SideNavBar — US-025 SC9', () => {
  it('SC9.1 — rendu avec data-testid="side-nav-bar"', () => {
    render(<SideNavBar />);
    expect(screen.getByTestId('side-nav-bar')).toBeTruthy();
  });

  it('SC9.2 — item "Préparation" actif quand activePage="preparation"', () => {
    render(<SideNavBar activePage="preparation" />);
    const btn = screen.getByTestId('side-nav-bar-preparation');
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('SC9.2 — item "Supervision" inactif quand activePage="preparation"', () => {
    render(<SideNavBar activePage="preparation" />);
    const btn = screen.getByTestId('side-nav-bar-supervision');
    expect(btn).not.toHaveAttribute('aria-current', 'page');
  });

  it('SC9.3 — item "Supervision" actif quand activePage="supervision"', () => {
    render(<SideNavBar activePage="supervision" />);
    const btn = screen.getByTestId('side-nav-bar-supervision');
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('SC9.3 — item "Préparation" inactif quand activePage="supervision"', () => {
    render(<SideNavBar activePage="supervision" />);
    const btn = screen.getByTestId('side-nav-bar-preparation');
    expect(btn).not.toHaveAttribute('aria-current', 'page');
  });

  it('SC9.5 — onNavigatePreparation appelé au clic sur Préparation', () => {
    const mockNav = jest.fn();
    render(<SideNavBar onNavigatePreparation={mockNav} />);
    fireEvent.click(screen.getByTestId('side-nav-bar-preparation'));
    expect(mockNav).toHaveBeenCalledTimes(1);
  });

  it('SC9.5 — onNavigateSupervision appelé au clic sur Supervision', () => {
    const mockNav = jest.fn();
    render(<SideNavBar onNavigateSupervision={mockNav} />);
    fireEvent.click(screen.getByTestId('side-nav-bar-supervision'));
    expect(mockNav).toHaveBeenCalledTimes(1);
  });

  it('SC9.6 — liens Aide et Déconnexion présents', () => {
    render(<SideNavBar />);
    expect(screen.getByTestId('side-nav-bar-aide')).toBeTruthy();
    expect(screen.getByTestId('side-nav-bar-deconnexion')).toBeTruthy();
  });

  it('SC9.7 — onDeconnexion appelé au clic sur Déconnexion', () => {
    const mockDeconnexion = jest.fn();
    render(<SideNavBar onDeconnexion={mockDeconnexion} />);
    fireEvent.click(screen.getByTestId('side-nav-bar-deconnexion'));
    expect(mockDeconnexion).toHaveBeenCalledTimes(1);
  });

  it('SC9 — contient les libellés Préparation et Supervision', () => {
    render(<SideNavBar />);
    expect(screen.getByText('Préparation')).toBeTruthy();
    expect(screen.getByText('Supervision')).toBeTruthy();
  });
});
