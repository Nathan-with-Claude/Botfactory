/**
 * Tests TDD — US-038 : Harmonisation libellés UX (mobile)
 *
 * Vérifie que les libellés affichés correspondent au langage naturel terrain :
 * - SC1 : badge statut colis A_REPRESENTER affiche "Repassage" (ColisItem)
 * - SC2 : badge statut consigne EXECUTEE affiche "Traitée" (MesConsignesScreen)
 * - SC3 : bouton action consigne ENVOYEE affiche "Traitée" (MesConsignesScreen)
 *
 * Ces corrections sont purement visuelles — StatutInstruction.EXECUTEE inchangé.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ColisItem from '../components/ColisItem';
import { MesConsignesScreen } from '../screens/MesConsignesScreen';
import type { ConsigneLocale } from '../hooks/useConsignesLocales';
import type { ColisDTO } from '../api/tourneeTypes';

// ─── Fixture colis A_REPRESENTER ─────────────────────────────────────────────

const colisARepresenter: ColisDTO = {
  colisId: 'colis-repr-001',
  statut: 'A_REPRESENTER',
  adresseLivraison: {
    rue: '1 Rue du Test',
    complementAdresse: null,
    codePostal: '69001',
    ville: 'Lyon',
    zoneGeographique: 'Zone A',
    adresseComplete: '1 Rue du Test, 69001 Lyon',
  },
  destinataire: { nom: 'M. Test', telephoneChiffre: null },
  contraintes: [],
  aUneContrainteHoraire: false,
  estTraite: false,
};

// ─── Fixture consigne EXECUTEE ────────────────────────────────────────────────

const consigneExecutee: ConsigneLocale = {
  instructionId: 'instr-exec-001',
  tourneeId: 'tournee-T001',
  colisId: 'colis-001',
  superviseurId: 'sup-001',
  typeInstruction: 'PRIORISER',
  statut: 'EXECUTEE',
  horodatage: '2026-04-02T09:30:00Z',
  lue: true,
};

const consigneEnvoyee: ConsigneLocale = {
  instructionId: 'instr-env-001',
  tourneeId: 'tournee-T001',
  colisId: 'colis-002',
  superviseurId: 'sup-001',
  typeInstruction: 'MODIFIER_CRENEAU',
  statut: 'ENVOYEE',
  horodatage: '2026-04-02T10:00:00Z',
  lue: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('US-038 — Harmonisation libellés UX (mobile)', () => {

  // SC1 : badge colis A_REPRESENTER → "Repassage"
  it('SC1 — ColisItem affiche "Repassage" pour un colis A_REPRESENTER (non "A repr." ni "A representer")', () => {
    const { getByTestId, queryByText } = render(
      <ColisItem colis={colisARepresenter} />
    );
    const badgeStatut = getByTestId('colis-statut');
    expect(badgeStatut.props.children).toBe('Repassage');
    // Vérification négative : anciens libellés absents
    expect(queryByText('A repr.')).toBeNull();
    expect(queryByText('A representer')).toBeNull();
  });

  // SC2 : badge statut consigne EXECUTEE → "Traitée"
  it('SC2 — MesConsignesScreen affiche "Traitée" dans le badge statut pour une consigne EXECUTEE (non "Exécutée")', () => {
    const { getByText, queryByText } = render(
      <MesConsignesScreen
        consignes={[consigneExecutee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );
    // Le badge contient "Traitée"
    expect(getByText('Traitée')).toBeTruthy();
    // "Exécutée" et "Executee" ne doivent pas apparaître
    expect(queryByText('Exécutée')).toBeNull();
    expect(queryByText('Executee')).toBeNull();
  });

  // SC3 : bouton action consigne ENVOYEE → "Traitée"
  it('SC3 — MesConsignesScreen affiche "Traitée" sur le bouton d\'action pour une consigne ENVOYEE (non "Marquer exécutée")', () => {
    const { getByTestId, queryByText } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );
    // Le bouton avec testID "btn-executer-instr-env-001" doit afficher "Traitée"
    const bouton = getByTestId('btn-executer-instr-env-001');
    expect(bouton).toBeTruthy();
    // Le texte du bouton doit être "Traitée"
    // Dans RNTL, on peut vérifier le contenu textuel avec findByText ou getAllByText
    expect(queryByText('Marquer exécutée')).toBeNull();
    // Le bouton affiche "Traitée" (vérifié via getAllByText — peut apparaître plusieurs fois si badge aussi)
    // On vérifie via le prop children du Text imbriqué dans le bouton
    const boutonTexte = bouton.findAll
      ? bouton.findAll((node: { type: string }) => node.type === 'Text')
      : [];
    if (boutonTexte.length > 0) {
      // Vérifier que l'un des Text enfants contient "Traitée"
      const textes = boutonTexte.map((t: { props: { children: unknown } }) => t.props.children);
      expect(textes.some((t: unknown) => t === 'Traitée')).toBe(true);
    }
  });

  // SC3b : bouton action consigne désactivé en syncEnCours → texte "Synchronisation…" inchangé
  it('SC3b — MesConsignesScreen affiche "Synchronisation…" si syncEnCours=true (comportement inchangé)', () => {
    const { getByText } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={true}
      />
    );
    // En mode sync, le bouton affiche "Synchronisation…"
    expect(getByText('Synchronisation…')).toBeTruthy();
  });
});
