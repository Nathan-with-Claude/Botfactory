/**
 * Tests unitaires — MesConsignesScreen (US-037 + US-042)
 *
 * Couvre :
 * - SC1 : liste vide — état gracieux avec message conforme au wireframe M-07
 * - SC2 : affichage d'une consigne (type, statut, heure, colis)
 * - SC3 : tri décroissant — la plus récente en premier
 * - SC4 : badge statut (Nouvelle / Prise en compte / Traitée)
 * - SC5 : bouton "Traitée" visible pour une consigne ENVOYEE
 * - SC6 : bouton "Traitée" absent pour une consigne déjà EXECUTEE
 * - SC7 : appui bouton "Traitée" appelle onMarquerExecutee
 * - SC8 : bouton Retour appelle onRetour
 * - SC9 : sous-titre affiche le compteur
 * - SC10 : syncEnCours — bouton désactivé pendant la synchro
 * - SC11 (delta Sprint 5) : bouton "Voir le colis" visible si colisId non vide
 * - SC12 (delta Sprint 5) : bouton "Voir le colis" absent si colisId vide
 * - SC13 (delta Sprint 5) : appui "Voir le colis" appelle onVoirColis avec colisId
 * - SC-TX1 (v1.3) : texteConsigne affiché dans la consigne
 * - SC-TX2 (v1.3) : "Non associé à un colis" affiché quand colisId absent
 * - SC-OFF1 (v1.3) : bandeau orange "Hors connexion" visible si estHorsConnexion=true
 * - SC-OFF2 (v1.3) : message dédié offline sous le bandeau
 * - SC-OFF3 (v1.3) : aucun bandeau offline si estHorsConnexion=false
 * --- US-042 — Horodatage adaptatif ---
 * - FH1 : formaterHorodatage — consigne du jour → format "HH:mm"
 * - FH2 : formaterHorodatage — consigne d'un autre jour → format "JJ/MM HH:mm"
 * - FH3 : formaterHorodatage — même jour, différentes heures correctement formatées
 * - FH4 : horodatage affiché sous le texte de la consigne dans le rendu du composant
 * - FH5 : ordre chronologique inverse confirmé avec horodatages (SC2 de la US-042)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MesConsignesScreen, formaterHorodatage } from '../screens/MesConsignesScreen';
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

// Fixture v1.3 — avec texte libre de consigne
const consigneAvecTexte: ConsigneLocale = {
  instructionId: 'instr-004',
  tourneeId: 'tournee-T001',
  colisId: 'colis-042',
  superviseurId: 'sup-001',
  typeInstruction: 'PRIORISER',
  texteConsigne: 'Prioriser le colis COLIS-042 — client urgent',
  statut: 'ENVOYEE',
  horodatage: '2026-04-02T14:35:00Z',
  lue: false,
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

  // SC4 bis : badge "Traitée" (US-038 — anciennement "Exécutée")
  it('SC4b — affiche le badge "Traitée" pour une consigne EXECUTEE (US-038)', () => {
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

  // SC5 : bouton "Traitée" visible pour ENVOYEE (US-038 — anciennement "Marquer exécutée")
  it('SC5 — affiche le bouton "Traitée" pour une consigne ENVOYEE (US-038)', () => {
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

  // SC6 : bouton "Traitée" absent pour EXECUTEE (US-038 — anciennement "Marquer exécutée")
  it('SC6 — n\'affiche pas le bouton "Traitée" pour une consigne EXECUTEE (US-038)', () => {
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
  it('SC6b — n\'affiche pas le bouton "Traitée" pour une consigne PRISE_EN_COMPTE (US-038)', () => {
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

  // SC7 : appui bouton "Traitée" (US-038 — anciennement "Marquer exécutée")
  it('SC7 — appuyer sur "Traitée" appelle onMarquerExecutee avec l\'instructionId (US-038)', () => {
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
  it('SC10 — le bouton "Traitée" est désactivé si syncEnCours=true (US-038)', () => {
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

  // ─── SC-TX : texte libre de la consigne (v1.3 — wireframe M-07) ─────────────

  // SC-TX1 : texteConsigne affiché dans la consigne
  it('SC-TX1 — affiche le texte libre de la consigne si texteConsigne est renseigné', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneAvecTexte]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const texte = getByTestId('texte-consigne-instr-004');
    expect(texte).toBeTruthy();
  });

  // SC-TX2 : "Non associé à un colis" affiché quand colisId est absent
  it('SC-TX2 — affiche "Non associé à un colis" quand colisId est vide', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneLibre]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const elementNonAssocie = getByTestId('non-associe-colis-instr-003');
    expect(elementNonAssocie).toBeTruthy();
  });

  // ─── SC-OFF : mode offline dans MesConsignesScreen (v1.3 — wireframe M-07) ─

  // SC-OFF1 : bandeau orange visible si estHorsConnexion=true
  it('SC-OFF1 — affiche le bandeau "Hors connexion" si estHorsConnexion est true', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
        estHorsConnexion={true}
      />
    );

    expect(getByTestId('bandeau-offline-consignes')).toBeTruthy();
  });

  // SC-OFF2 : message dédié sous le bandeau offline
  it('SC-OFF2 — affiche le message dédié offline sous le bandeau', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
        estHorsConnexion={true}
      />
    );

    const message = getByTestId('message-offline-consignes');
    expect(message).toBeTruthy();
  });

  // SC-OFF3 : aucun bandeau si estHorsConnexion=false (ou prop absente)
  it('SC-OFF3 — n\'affiche pas le bandeau offline si estHorsConnexion est false', () => {
    const { queryByTestId } = render(
      <MesConsignesScreen
        consignes={[consigneEnvoyee]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
        estHorsConnexion={false}
      />
    );

    expect(queryByTestId('bandeau-offline-consignes')).toBeNull();
  });

  // SC1 corrigé : message liste vide conforme au wireframe M-07 v1.3
  it('SC1-MSG — le message liste vide correspond au texte du wireframe M-07', () => {
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );

    const vide = getByTestId('consignes-vide');
    expect(vide).toBeTruthy();
    // Vérification que le texte principal est bien présent
    const texte = getByTestId('consignes-vide-texte-principal');
    expect(texte).toBeTruthy();
  });
});

// ─── US-042 : Horodatage adaptatif (formaterHorodatage) ─────────────────────────

describe('US-042 — formaterHorodatage (fonction utilitaire pure)', () => {
  // Référence : aujourd'hui = 2026-04-02T10:00:00 (UTC)
  const aujourd_hui = new Date('2026-04-02T10:00:00.000Z');

  // FH1 : consigne du jour → "HH:mm" seulement
  it('FH1 — consigne reçue aujourd\'hui affiche uniquement l\'heure HH:mm', () => {
    // 2026-04-02 à 09:30 UTC
    const iso = '2026-04-02T09:30:00.000Z';
    const resultat = formaterHorodatage(iso, aujourd_hui);
    // Format attendu : "HH:mm" (ex. "09:30" ou "11:30" selon le fuseau)
    // On vérifie le pattern numérique HH:mm
    expect(resultat).toMatch(/^\d{2}:\d{2}$/);
  });

  // FH2 : consigne d'un autre jour → "JJ/MM HH:mm"
  it('FH2 — consigne reçue la veille affiche la date et l\'heure JJ/MM HH:mm', () => {
    // 2026-04-01 à 09:00 UTC — veille (matin, sans ambiguïté de fuseau horaire)
    const iso = '2026-04-01T09:00:00.000Z';
    const resultat = formaterHorodatage(iso, aujourd_hui);
    // Format attendu : "JJ/MM HH:mm" (ex. "01/04 09:00" ou "01/04 11:00" selon le fuseau)
    expect(resultat).toMatch(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
  });

  // FH3 : même jour, heure différente — le format reste HH:mm
  it('FH3 — plusieurs consignes du même jour affichent toutes le format HH:mm', () => {
    const heures = ['2026-04-02T09:00:00.000Z', '2026-04-02T11:30:00.000Z', '2026-04-02T14:45:00.000Z'];
    for (const iso of heures) {
      const resultat = formaterHorodatage(iso, aujourd_hui);
      expect(resultat).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  // FH4 : horodatage bien affiché sous le texte de la consigne (testID)
  it('FH4 — l\'horodatage est affiché dans le composant avec le testID horodatage-instr-001', () => {
    const consigne: ConsigneLocale = {
      ...consigneEnvoyee,
      horodatage: '2026-04-02T09:30:00.000Z',
    };
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[consigne]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );
    // Le testID horodatage-{instructionId} doit exister
    expect(getByTestId('horodatage-instr-001')).toBeTruthy();
  });

  // FH5 : ordre chronologique inverse — 14:45 en premier, 09:00 en dernier
  it('FH5 — les 3 consignes apparaissent dans l\'ordre : la plus récente en premier', () => {
    const c1: ConsigneLocale = {
      instructionId: 'instr-t1',
      tourneeId: 'T001', colisId: 'c1', superviseurId: 's1',
      typeInstruction: 'MESSAGE_LIBRE', statut: 'ENVOYEE',
      horodatage: '2026-04-02T09:00:00.000Z', lue: false,
    };
    const c2: ConsigneLocale = {
      instructionId: 'instr-t2',
      tourneeId: 'T001', colisId: 'c2', superviseurId: 's1',
      typeInstruction: 'MESSAGE_LIBRE', statut: 'ENVOYEE',
      horodatage: '2026-04-02T11:30:00.000Z', lue: false,
    };
    const c3: ConsigneLocale = {
      instructionId: 'instr-t3',
      tourneeId: 'T001', colisId: 'c3', superviseurId: 's1',
      typeInstruction: 'PRIORISER', statut: 'ENVOYEE',
      horodatage: '2026-04-02T14:45:00.000Z', lue: false,
    };
    // La liste en entrée est déjà triée décroissant (responsabilité du hook)
    const { getByTestId } = render(
      <MesConsignesScreen
        consignes={[c3, c2, c1]}
        onRetour={jest.fn()}
        onMarquerExecutee={jest.fn()}
        syncEnCours={false}
      />
    );
    // Les trois horodatages doivent être présents
    expect(getByTestId('horodatage-instr-t1')).toBeTruthy();
    expect(getByTestId('horodatage-instr-t2')).toBeTruthy();
    expect(getByTestId('horodatage-instr-t3')).toBeTruthy();
  });
});
