import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BroadcastOverlay from '../components/BroadcastOverlay';

/**
 * Tests Jest — BroadcastOverlay (US-068)
 * Composant overlay notification broadcast superviseur.
 */

const broadcastAlerte = {
  broadcastMessageId: 'bc-001',
  type: 'ALERTE' as const,
  texte: 'Attention : zone inondée secteur Nord — évitez la rue des Lilas',
  superviseurNom: 'Marie Dupont',
};

const broadcastInfo = {
  broadcastMessageId: 'bc-002',
  type: 'INFO' as const,
  texte: 'Réunion de débriefing à 18h30 au dépôt',
};

describe('BroadcastOverlay (US-068)', () => {
  it('rend null si broadcast est null', () => {
    const { queryByTestId } = render(
      <BroadcastOverlay
        broadcast={null}
        onVoir={jest.fn()}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    expect(queryByTestId('broadcast-overlay')).toBeNull();
  });

  it('affiche le badge coloré pour le type ALERTE', () => {
    const { getByTestId } = render(
      <BroadcastOverlay
        broadcast={broadcastAlerte}
        onVoir={jest.fn()}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    const overlay = getByTestId('broadcast-overlay');
    expect(overlay).toBeTruthy();

    const badge = getByTestId('badge-type-broadcast');
    expect(badge.props.children).toBe('ALERTE');
  });

  it('affiche le badge coloré pour le type INFO', () => {
    const { getByTestId } = render(
      <BroadcastOverlay
        broadcast={broadcastInfo}
        onVoir={jest.fn()}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    const badge = getByTestId('badge-type-broadcast');
    expect(badge.props.children).toBe('INFO');
  });

  it('appelle onFermer au clic sur le bouton ×', () => {
    const onFermer = jest.fn();

    const { getByTestId } = render(
      <BroadcastOverlay
        broadcast={broadcastAlerte}
        onVoir={jest.fn()}
        onFermer={onFermer}
        autoFermetureMs={60000}
      />
    );

    fireEvent.press(getByTestId('bouton-fermer-broadcast'));
    expect(onFermer).toHaveBeenCalledTimes(1);
  });

  it('appelle onVoir au clic sur le bouton VOIR', () => {
    const onVoir = jest.fn();

    const { getByTestId } = render(
      <BroadcastOverlay
        broadcast={broadcastAlerte}
        onVoir={onVoir}
        onFermer={jest.fn()}
        autoFermetureMs={60000}
      />
    );

    fireEvent.press(getByTestId('bouton-voir-broadcast'));
    expect(onVoir).toHaveBeenCalledTimes(1);
  });
});
