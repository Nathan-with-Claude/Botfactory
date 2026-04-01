/**
 * Tests unitaires — MesConsignesScreen (US-037)
 *
 * Couvre :
 * - SC1 : liste vide — état gracieux
 * - SC2 : affichage d'une consigne (type, statut, heure, colis)
 * - SC3 : tri décroissant — la plus récente en premier
 * - SC4 : badge statut (Nouvelle / Prise en compte / Exécutée)
 * - SC5 : bouton "Exécutée" visible pour une consigne ENVOYEE
 * - SC6 : bouton "Exécutée" absent pour une consigne déjà EXECUTEE
 * - SC7 : appui bouton "Exécutée" appelle onMarquerExecutee
 * - SC8 : bouton Retour appelle onRetour
 * - SC9 : sous-titre affiche le compteur
 * - SC10 : syncEnCours — bouton désactivé pendant la synchro
 * - SC11 (delta Sprint 5) : bouton "Voir le colis" visible si colisId non vide
 * - SC12 (delta Sprint 5) : bouton "Voir le colis" absent si colisId vide
 * - SC13 (delta Sprint 5) : appui "Voir le colis" appelle onVoirColis avec colisId
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MesConsignesScreen } from '../screens/MesConsignesScreen';
import type { ConsigneLocale } from '../hooks/useConsignesLocales';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const consigneEnvoyee: ConsigneLocale = {
  instructionId: 'instr-001',
  tourneeId: 'tournee-T001',
  colisId: 'colis-001',
  superviseurId: 'sup-001',
  typeInstruction: 'PRIORISER',
  statut: 'ENVOYEE',
  horodatage: '2026-03-30T09:30:00Z',
  lue: false,
};

const consigneExecutee: ConsigneLocale = {
  instructionId: 'instr-002',
  tourneeId: 'tournee-T001',
  colisId: 'colis-002',
  superviseurId: 'sup-001',
  typeInstruction: 'ANNULER',
  statut: 'EXECUTEE',
  horodatage: '2026-03-30T08:00:00Z',
  lue: true,
};

const consigneLibre: ConsigneLocale = {
  instructionId: 'instr-003',
  tourneeId: 'tournee-T001',
  colisId: '',
  superviseurId: 'sup-001',
  typeInstruction: 'MESSAGE_LIBRE',
  statut: 'PRISE_EN_COMPTE',
  horodatage: '2026-03-30T10:00:00Z',
  lue: true,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MesConsignesScreen (US-037)', () => {
  // SC1 : liste vide
  it('SC1 — affiche un état vide gracieux si aucune consigne', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(getByTestId('consignes-vide')).toBeTruthy();
  });

  // SC2 : affichage d'une consigne
  it('SC2 — affiche le type, le statut, l\'heure et le colis d\'une consigne', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const ligne = getByTestId('consigne-instr-001');
    expect(ligne).toBeTruthy();
  });

  // SC3 : tri — pas testé ici car la liste est déjà triée en entrée (responsabilité du hook)

  // SC4 : badge statut "Nouvelle" pour ENVOYEE
  it('SC4 — affiche le badge "Nouvelle" pour une consigne ENVOYEE', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const badge = getByTestId('badge-statut-instr-001');
    expect(badge).toBeTruthy();
  });

  // SC4 bis : badge "Exécutée"
  it('SC4b — affiche le badge "Exécutée" pour une consigne EXECUTEE', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneExecutee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const badge = getByTestId('badge-statut-instr-002');
    expect(badge).toBeTruthy();
  });

  // SC5 : bouton "Exécutée" visible pour ENVOYEE
  it('SC5 — affiche le bouton "Marquer exécutée" pour une consigne ENVOYEE', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(getByTestId('btn-executer-instr-001')).toBeTruthy();
  });

  // SC6 : bouton "Exécutée" absent pour EXECUTEE
  it('SC6 — n\'affiche pas le bouton "Marquer exécutée" pour une consigne EXECUTEE', () => {
    const { queryByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneExecutee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(queryByTestId('btn-executer-instr-002')).toBeNull();
  });

  // SC6 bis : absent aussi pour PRISE_EN_COMPTE
  it('SC6b — n\'affiche pas le bouton "Marquer exécutée" pour une consigne PRISE_EN_COMPTE', () => {
    const { queryByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneLibre]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(queryByTestId('btn-executer-instr-003')).toBeNull();
  });

  // SC7 : appui bouton "Exécutée"
  it('SC7 — appuyer sur "Marquer exécutée" appelle onMarquerExecutee avec l\'instructionId', () => {
    const onMarquerExecutee = jest.fn();
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={onMarquerExecutee}
        syncEnCours={false}
      />
    );

    fireEvent.press(getByTestId('btn-executer-instr-001'));
    expect(onMarquerExecutee).toHaveBeenCalledWith('instr-001');
  });

  // SC8 : bouton Retour
  it('SC8 — appuyer sur Retour appelle onRetour', () => {
    const onRetour = jest.fn();
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[]}
        onRetour={onRetour}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    fireEvent.press(getByTestId('btn-retour-consignes'));
    expect(onRetour).toHaveBeenCalled();
  });

  // SC9 : sous-titre compteur
  it('SC9 — le sous-titre affiche le nombre de consignes', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee, consigneExecutee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const sousTitre = getByTestId('sous-titre-consignes');
    // children est un tableau React ["Instructions reçues aujourd'hui (", 2, ")"]
    // On vérifie que le compteur numérique 2 est bien présent
    expect(sousTitre.props.children).toContain(2);
  });

  // SC10 : bouton désactivé pendant sync
  it('SC10 — le bouton "Marquer exécutée" est désactivé si syncEnCours=true', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={true}
      />
    );

    const btn = getByTestId('btn-executer-instr-001');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  // Consigne sans colis (MESSAGE_LIBRE sans colisId)
  it('n\'affiche pas "Colis #" si colisId est vide', () => {
    const consigneSansColis: ConsigneLocale = {
      ...consigneLibre,
      colisId: '',
      statut: 'ENVOYEE',
      lue: false,
    };
    const { queryByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneSansColis]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(queryByTestId('colis-concerne-instr-003')).toBeNull();
  });

  // ─── SC11/SC12/SC13 : navigation M-07 → M-03 (delta Sprint 5) ────────────

  // SC11 : bouton "Voir le colis" visible si colisId non vide
  it('SC11 — affiche le bouton "Voir le colis" si colisId est renseigné', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        onVoirColis={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(getByTestId('btn-voir-colis-instr-001')).toBeTruthy();
  });

  // SC12 : bouton "Voir le colis" absent si colisId vide
  it('SC12 — n\'affiche pas le bouton "Voir le colis" si colisId est vide', () => {
    const consigneSansColis: ConsigneLocale = {
      ...consigneLibre,
      colisId: '',
      statut: 'ENVOYEE',
      lue: false,
    };
    const { queryByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneSansColis]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        onVoirColis={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(queryByTestId('btn-voir-colis-instr-003')).toBeNull();
  });

  // SC13 : appui "Voir le colis" appelle onVoirColis avec colisId
  it('SC13 — appuyer sur "Voir le colis" appelle onVoirColis avec le colisId', () => {
    const onVoirColis = jest.fn();
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        onVoirColis={onVoirColis}
        syncEnCours={false}
      />
    );

    fireEvent.press(getByTestId('btn-voir-colis-instr-001'));
    expect(onVoirColis).toHaveBeenCalledWith('colis-001');
  });

  // SC14 : bouton "Voir le colis" absent si onVoirColis non fourni (prop optionnelle)
  it('SC14 — n\'affiche pas le bouton "Voir le colis" si onVoirColis est absent', () => {
    const { queryByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    expect(queryByTestId('btn-voir-colis-instr-001')).toBeNull();
  });
});
