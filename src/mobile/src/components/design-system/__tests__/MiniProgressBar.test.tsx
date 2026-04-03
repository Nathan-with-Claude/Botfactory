/**
 * Tests TDD — MiniProgressBar (DC-07) — US-031
 *
 * Barre de progression fine (4px) indiquant l'avancement d'un formulaire.
 * Utilisee sur M-04 avec progress=0.75.
 * Priorite P1.
 *
 * Scenarions couverts :
 * - Rendu sans erreur
 * - Props progress : largeur de la barre proportionnelle
 * - Props color : couleur de la barre
 * - Valeurs limites : 0 et 1
 * - Hauteur de la barre : 4px
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { MiniProgressBar } from '../MiniProgressBar';

describe('MiniProgressBar (DC-07) — US-031', () => {
  describe('Rendu de base', () => {
    it('rend le composant sans erreur', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.75} />
      );
      expect(getByTestId('mini-progress-bar')).toBeTruthy();
    });

    it('rend la barre de progression interne', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.5} />
      );
      expect(getByTestId('mini-progress-bar-fill')).toBeTruthy();
    });
  });

  describe('Hauteur', () => {
    it('a une hauteur de 4px (h-1)', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.5} />
      );
      const container = getByTestId('mini-progress-bar');
      const style = container.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.height).toBe(4);
    });
  });

  describe('Progression', () => {
    it('applique la proportion correcte a la barre interne (75%)', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.75} />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      // La largeur en % doit etre 75%
      expect(flatStyle.width).toBe('75%');
    });

    it('affiche 0% si progress=0', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0} />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.width).toBe('0%');
    });

    it('affiche 100% si progress=1', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={1} />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.width).toBe('100%');
    });

    it('clamp a 100% si progress > 1', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={1.5} />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.width).toBe('100%');
    });

    it('clamp a 0% si progress < 0', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={-0.5} />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.width).toBe('0%');
    });
  });

  describe('Couleur', () => {
    it('utilise Colors.primaire par defaut', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.5} />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.backgroundColor).toBe('#1D4ED8');
    });

    it('utilise la couleur passee en prop', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.5} color="#16A34A" />
      );
      const fill = getByTestId('mini-progress-bar-fill');
      const style = fill.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.backgroundColor).toBe('#16A34A');
    });
  });

  describe('Style', () => {
    it('a un borderRadius de 2px', () => {
      const { getByTestId } = render(
        <MiniProgressBar progress={0.5} />
      );
      const container = getByTestId('mini-progress-bar');
      const style = container.props.style;
      const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
      expect(flatStyle.borderRadius).toBe(2);
    });
  });
});
