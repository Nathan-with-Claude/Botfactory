import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ColisDTO, StatutColis } from '../api/tourneeTypes';

/**
 * Composant — ColisItem
 * Affiche un colis dans la liste de la tournee (ecran M-02).
 *
 * Affiche :
 * - Adresse complete du colis
 * - Nom du destinataire
 * - Badge statut colore (A_LIVRER = bleu, LIVRE = vert, ECHEC = rouge, A_REPRESENTER = orange)
 * - Contraintes (mise en evidence si contrainte horaire)
 *
 * Source wireframe : M-02 — Liste des colis de la tournee.
 */

interface ColisItemProps {
  colis: ColisDTO;
}

const STATUT_LABELS: Record<StatutColis, string> = {
  A_LIVRER: 'A livrer',
  LIVRE: 'Livre',
  ECHEC: 'Echec',
  A_REPRESENTER: 'A representer',
};

const STATUT_COLORS: Record<StatutColis, string> = {
  A_LIVRER: '#2196F3',  // bleu
  LIVRE: '#4CAF50',     // vert
  ECHEC: '#F44336',     // rouge
  A_REPRESENTER: '#FF9800', // orange
};

export const ColisItem: React.FC<ColisItemProps> = ({ colis }) => {
  const statutColor = STATUT_COLORS[colis.statut];
  const statutLabel = STATUT_LABELS[colis.statut];
  const estTraite = colis.statut !== 'A_LIVRER';

  return (
    <View
      style={[styles.container, estTraite && styles.containerTraite]}
      testID="colis-item"
    >
      {/* En-tete : adresse + badge statut */}
      <View style={styles.header}>
        <Text
          style={[styles.adresse, estTraite && styles.adresseTraite]}
          numberOfLines={2}
          testID="colis-adresse"
        >
          {colis.adresseLivraison.adresseComplete}
        </Text>
        <View style={[styles.badge, { backgroundColor: statutColor }]}>
          <Text style={styles.badgeText} testID="colis-statut">
            {statutLabel}
          </Text>
        </View>
      </View>

      {/* Destinataire */}
      <Text style={styles.destinataire} testID="colis-destinataire">
        {colis.destinataire.nom}
      </Text>

      {/* Contraintes */}
      {colis.contraintes.length > 0 && (
        <View style={styles.contraintesContainer} testID="colis-contraintes">
          {colis.contraintes.map((contrainte, idx) => (
            <View
              key={idx}
              style={[
                styles.contrainte,
                contrainte.estHoraire && styles.contrainteHoraire,
              ]}
              testID={`colis-contrainte-${idx}`}
            >
              <Text
                style={[
                  styles.contrainteText,
                  contrainte.estHoraire && styles.contrainteHoraireText,
                ]}
              >
                {contrainte.estHoraire ? '⚑ ' : ''}{contrainte.valeur}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerTraite: {
    opacity: 0.6,
    borderLeftColor: '#9E9E9E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  adresse: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  adresseTraite: {
    color: '#757575',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  destinataire: {
    fontSize: 13,
    color: '#424242',
    marginTop: 4,
  },
  contraintesContainer: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  contrainte: {
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  contrainteHoraire: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  contrainteText: {
    fontSize: 12,
    color: '#616161',
  },
  contrainteHoraireText: {
    color: '#E65100',
    fontWeight: '600',
  },
});

export default ColisItem;
