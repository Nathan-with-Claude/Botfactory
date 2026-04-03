/**
 * Tests TDD — IndicateurSync (Mobile) (US-025)
 *
 * Composant indicateur de synchronisation React Native.
 * Source design-system.md §3.6.
 *
 * Scénarios couverts :
 * - SC6 : état OFFLINE
 * - État LIVE
 * - État POLLING
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { IndicateurSync } from '../IndicateurSync';

describe('IndicateurSync (mobile) — US-025 §3.6', () => {

  describe('SC6 — état OFFLINE', () => {
    it('affiche le label "OFFLINE"', () => {
      const { getByText } = render(<IndicateurSync syncStatus="offline" />);
      expect(getByText('OFFLINE')).toBeTruthy();
    });

    it('affiche le point de statut', () => {
      const { getByTestId } = render(<IndicateurSync syncStatus="offline" />);
      expect(getByTestId('sync-point')).toBeTruthy();
    });
  });

  describe('État LIVE', () => {
    it('affiche le label "LIVE"', () => {
      const { getByText } = render(<IndicateurSync syncStatus="live" />);
      expect(getByText('LIVE')).toBeTruthy();
    });
  });

  describe('État POLLING', () => {
    it('affiche le label "POLLING"', () => {
      const { getByText } = render(<IndicateurSync syncStatus="polling" />);
      expect(getByText('POLLING')).toBeTruthy();
    });
  });

  describe('État SYNCING', () => {
    it('affiche le label "SYNC"', () => {
      const { getByText } = render(<IndicateurSync syncStatus="syncing" />);
      expect(getByText('SYNC')).toBeTruthy();
    });
  });
});
