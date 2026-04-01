/**
 * Tests TDD — IndicateurSync (US-025)
 *
 * Composant indicateur de synchronisation (web et mobile).
 * Source design-system.md §3.6.
 *
 * Scénarios couverts :
 * - SC6 : état OFFLINE
 * - État LIVE avec animation pulse
 * - État POLLING
 * - État SYNC (synchronisation en cours)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { IndicateurSync } from '../IndicateurSync';

describe('IndicateurSync — US-025 §3.6', () => {

  describe('SC6 — état OFFLINE', () => {
    it('affiche le point rouge si syncStatus="offline"', () => {
      render(<IndicateurSync syncStatus="offline" />);
      const point = screen.getByTestId('sync-point');
      expect(point).toBeInTheDocument();
      expect(point).toHaveAttribute('data-status', 'offline');
    });

    it('affiche le label "OFFLINE"', () => {
      render(<IndicateurSync syncStatus="offline" />);
      expect(screen.getByText('OFFLINE')).toBeInTheDocument();
    });

    it('n\'a pas la classe pulse-live si offline', () => {
      render(<IndicateurSync syncStatus="offline" />);
      expect(screen.getByTestId('sync-point')).not.toHaveClass('pulse-live');
    });
  });

  describe('État LIVE', () => {
    it('affiche le point vert si syncStatus="live"', () => {
      render(<IndicateurSync syncStatus="live" />);
      expect(screen.getByTestId('sync-point')).toHaveAttribute('data-status', 'live');
    });

    it('affiche le label "LIVE"', () => {
      render(<IndicateurSync syncStatus="live" />);
      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    it('a la classe pulse-live si live', () => {
      render(<IndicateurSync syncStatus="live" />);
      expect(screen.getByTestId('sync-point')).toHaveClass('pulse-live');
    });
  });

  describe('État POLLING', () => {
    it('affiche le label "POLLING" si polling', () => {
      render(<IndicateurSync syncStatus="polling" />);
      expect(screen.getByText('POLLING')).toBeInTheDocument();
    });
  });

  describe('État SYNC', () => {
    it('affiche l\'icône de rotation si syncStatus="syncing"', () => {
      render(<IndicateurSync syncStatus="syncing" />);
      expect(screen.getByTestId('sync-icone-rotation')).toBeInTheDocument();
    });
  });
});
