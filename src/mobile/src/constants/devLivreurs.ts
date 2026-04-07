/**
 * devLivreurs — Comptes livreurs de développement (US-047)
 *
 * Utilisé uniquement en mode __DEV__ pour simuler la connexion
 * sans Keycloak. Ces identifiants correspondent exactement au
 * seed de données de l'outil de supervision (DevDataSeeder).
 *
 * NE PAS IMPORTER en production (tree-shaken par Metro via __DEV__ guard dans App.tsx).
 */

export interface DevLivreur {
  id: string;
  prenom: string;
  nom: string;
}

export const DEV_LIVREURS: DevLivreur[] = [
  { id: 'livreur-001', prenom: 'Pierre', nom: 'Martin' },
  { id: 'livreur-002', prenom: 'Paul', nom: 'Dupont' },
  { id: 'livreur-003', prenom: 'Marie', nom: 'Lambert' },
  { id: 'livreur-004', prenom: 'Jean', nom: 'Moreau' },
  { id: 'livreur-005', prenom: 'Sophie', nom: 'Bernard' },
  { id: 'livreur-006', prenom: 'Lucas', nom: 'Petit' },
];
