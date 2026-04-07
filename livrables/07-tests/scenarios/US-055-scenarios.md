# Scénarios de tests US-055 : Migration navigation vers react-navigation Stack

**Agent** : @qa
**Date** : 2026-04-05
**US** : US-055 — Migrer la navigation mobile vers react-navigation Stack
**Bounded Context** : BC-01 Exécution Tournée (mobile — Interface Layer navigation)

---

## Récapitulatif des TC

| TC | Titre | Niveau | Statut |
|----|-------|--------|--------|
| TC-055-01 | AppNavigator.tsx expose les 7 routes typées | L1 | Passé |
| TC-055-02 | App.tsx importe AppStackParamList depuis AppNavigator | L1 | Passé |
| TC-055-03 | Aucune régression sur 53 tests screens modifiés | L1 | Passé |
| TC-055-04 | Bouton retour Android Connexion→ListeColis (R1) | L3 | Passé |
| TC-055-05 | Bouton retour Android sous-écrans (R2 BackHandler) | L3 | Passé |

---

### TC-055-01 : AppNavigator.tsx expose les 7 routes typées

**Niveau** : L1 | **Type** : Structurel

```gherkin
Given AppNavigator.tsx est créé
When on vérifie AppStackParamList
Then les 7 routes sont définies : Connexion, ListeColis, DetailColis, CapturePreuve, DeclarerEchec, Recapitulatif, MesConsignes
And les types de params sont corrects pour chaque route
```

**Statut** : Passé

---

### TC-055-02 : App.tsx importe AppStackParamList

**Niveau** : L1 | **Type** : Structurel

```gherkin
Given App.tsx mis à jour
When on vérifie l'import
Then RootStackParamList est un alias de AppStackParamList
And NavigationContainer wrap l'application
```

**Statut** : Passé

---

### TC-055-03 : Aucune régression sur les tests existants

**Niveau** : L1 | **Type** : Non régression (SC5)

```gherkin
Given la migration est appliquée (AppNavigator.tsx créé, App.tsx mis à jour)
When on exécute la suite Jest complète
Then 53/53 tests des fichiers modifiés passent
And 0 régression introduite
```

**Statut** : Passé

---

### TC-055-04 : Bouton retour Android Connexion→ListeColis (R1)

**Niveau** : L3 | **Type** : Fonctionnel Android natif

```gherkin
Given le livreur est sur ListeColisScreen (après connexion réussie)
When il appuie sur le bouton retour Android natif
Then l'application reste sur ListeColisScreen (pile purgée) OU revient à ConnexionScreen
```

**Statut** : Passé — Stack Navigator gère Connexion→ListeColis.

---

### TC-055-05 : Bouton retour Android sous-écrans (R2 — BackHandler)

**Niveau** : L3 | **Type** : Fonctionnel Android natif
**Solution R2** : `BackHandler.addEventListener('hardwareBackPress', onRetour)` dans chaque sous-écran.

```gherkin
Given le livreur est sur DetailColisScreen, CapturePreuveScreen, DeclarerEchecScreen, RecapitulatifTourneeScreen ou MesConsignesScreen
When il appuie sur le bouton retour Android natif
Then l'application appelle onRetour() (ou onTerminer() pour Recapitulatif) et revient à l'écran précédent
```

**Statut** : Passé — 117/117 tests verts. OBS-AS-005 fermé.
