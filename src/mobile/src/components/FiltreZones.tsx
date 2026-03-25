/**
 * Composant — FiltreZones
 *
 * Affiche une barre d'onglets pour filtrer les colis par zone geographique (US-003).
 * Ecran M-02 — section onglets entre le bandeau de progression et la liste des colis.
 *
 * Props :
 * - zones : liste des zones disponibles (issues de extraireZonesDisponibles)
 * - zoneActive : zone actuellement selectionnee (ou ZONE_TOUS)
 * - onZoneChange : callback appele quand l'utilisateur appuie sur un onglet
 *
 * Invariants visuels :
 * - L'onglet "Tous" est toujours present en premier.
 * - L'onglet actif est mis en evidence (fond bleu, texte blanc).
 * - Les onglets inactifs sont sur fond blanc avec texte bleu.
 *
 * Source wireframe : M-02 — [Zone A] [Zone B] [Zone C] [Tous]
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FiltreZone, ZONE_TOUS } from '../domain/filtreZone';

interface FiltreZonesProps {
  zones: string[];
  zoneActive: FiltreZone;
  onZoneChange: (zone: FiltreZone) => void;
}

export const FiltreZones: React.FC<FiltreZonesProps> = ({
  zones,
  zoneActive,
  onZoneChange,
}) => {
  return (
    <View style={styles.container} testID="onglets-zones">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Onglet "Tous" — toujours present en premier */}
        <TouchableOpacity
          style={[styles.onglet, zoneActive === ZONE_TOUS && styles.ongletActif]}
          onPress={() => onZoneChange(ZONE_TOUS)}
          testID="onglet-tous"
          accessibilityRole="tab"
          accessibilityState={{ selected: zoneActive === ZONE_TOUS }}
          accessibilityLabel="Tous les colis"
        >
          <Text style={[styles.ongletText, zoneActive === ZONE_TOUS && styles.ongletTextActif]}>
            Tous
          </Text>
        </TouchableOpacity>

        {/* Onglets par zone */}
        {zones.map((zone) => (
          <TouchableOpacity
            key={zone}
            style={[styles.onglet, zoneActive === zone && styles.ongletActif]}
            onPress={() => onZoneChange(zone)}
            testID={`onglet-${zone}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: zoneActive === zone }}
            accessibilityLabel={`Zone ${zone}`}
          >
            <Text style={[styles.ongletText, zoneActive === zone && styles.ongletTextActif]}>
              {zone}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  onglet: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1565C0',
    backgroundColor: '#FFFFFF',
  },
  ongletActif: {
    backgroundColor: '#1565C0',
  },
  ongletText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565C0',
  },
  ongletTextActif: {
    color: '#FFFFFF',
  },
});

export default FiltreZones;
