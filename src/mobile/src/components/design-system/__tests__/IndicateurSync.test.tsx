/**
 * Tests TDD — IndicateurSync (Mobile) (US-025 + US-062)
 *
 * Composant indicateur de synchronisation React Native.
 * Source design-system.md §3.6.
 *
 * Scénarios couverts :
 * - SC6 : état OFFLINE
 * - État LIVE
 * - État POLLING
 * - US-062 : compteur envois en attente (pendingCount)
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

  // ─── US-062 : compteur envois en attente ──────────────────────────────────

  describe('US-062 — pendingCount : envois en attente', () => {
    it('LIVE sans pendingCount : affiche uniquement "LIVE"', () => {
      const { getByText, queryByTestId } = render(<IndicateurSync syncStatus="live" />);
      expect(getByText('LIVE')).toBeTruthy();
      expect(queryByTestId('sync-pending-count')).toBeNull();
    });

    it('LIVE avec pendingCount = 0 : affiche uniquement "LIVE" sans compteur', () => {
      const { getByText, queryByTestId } = render(
        <IndicateurSync syncStatus="live" pendingCount={0} />
      );
      expect(getByText('LIVE')).toBeTruthy();
      expect(queryByTestId('sync-pending-count')).toBeNull();
    });

    it('OFFLINE avec pendingCount > 0 : affiche "Pas de réseau — N envois en attente"', () => {
      const { getByTestId, getByText } = render(
        <IndicateurSync syncStatus="offline" pendingCount={3} />
      );
      expect(getByTestId('sync-pending-count')).toBeTruthy();
      expect(getByText('3 envois en attente')).toBeTruthy();
    });

    it('OFFLINE avec pendingCount = 1 : affiche "1 envoi en attente" (singulier)', () => {
      const { getByText } = render(
        <IndicateurSync syncStatus="offline" pendingCount={1} />
      );
      expect(getByText('1 envoi en attente')).toBeTruthy();
    });

    it('OFFLINE sans pendingCount : affiche "Pas de réseau" sans compteur', () => {
      const { queryByTestId } = render(<IndicateurSync syncStatus="offline" />);
      expect(queryByTestId('sync-pending-count')).toBeNull();
    });

    it('OFFLINE avec pendingCount = 0 : affiche "Pas de réseau" sans compteur', () => {
      const { queryByTestId } = render(
        <IndicateurSync syncStatus="offline" pendingCount={0} />
      );
      expect(queryByTestId('sync-pending-count')).toBeNull();
    });

    it('OFFLINE avec pendingCount > 0 : le testID sync-pending-count est présent', () => {
      const { getByTestId } = render(
        <IndicateurSync syncStatus="offline" pendingCount={5} />
      );
      const compteur = getByTestId('sync-pending-count');
      expect(compteur).toBeTruthy();
    });
  });
});
