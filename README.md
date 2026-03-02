# KoliGo - Application de gestion de livraison dernier kilometre

## Overview
KoliGo est une application mobile Expo React Native destinee aux livreurs de transport express pour la gestion du "dernier kilometre". L'app permet de gerer les tournees, scanner les colis, certifier les livraisons avec GPS, et signaler les incidents.

## Architecture

### Stack technique
- **Frontend**: Expo SDK 54, React Native, TypeScript, Expo Router (file-based routing)
- **Backend**: Express.js + TypeScript sur port 5000
- **State Management**: React Context (AuthContext, TourneeContext) + React Query
- **Navigation**: Auth Flow -> Tabs (Tournee, Carte, Scanner, Profil) -> Stacks (Detail, Livraison, Incident)
- **Data**: Mock API backend avec donnees realistes, AsyncStorage pour persistance locale

### Structure des dossiers
```
app/                    # Routes (Expo Router file-based)
  _layout.tsx           # Root layout avec providers + auth gate
  login.tsx             # Ecran de connexion
  (tabs)/               # Tab navigator
    _layout.tsx         # Config des tabs
    index.tsx           # Liste des colis (Tournee)
    map.tsx             # Carte des livraisons
    scan.tsx            # Scanner de codes-barres
    profile.tsx         # Profil du livreur
  parcel/               # Stack navigation colis
    _layout.tsx         # Layout stack
    [id].tsx            # Detail d'un colis
    deliver.tsx         # Validation de livraison (scan + GPS)
    incident.tsx        # Signalement d'incident
components/             # Composants reutilisables
  ParcelCard.tsx        # Carte de colis
  StatusBadge.tsx       # Badge de statut
  PriorityBadge.tsx     # Badge de priorite
  StatsBar.tsx          # Barre de statistiques
  LoadingScreen.tsx     # Ecran de chargement
  ErrorBoundary.tsx     # Error boundary
  ErrorFallback.tsx     # Fallback d'erreur
contexts/               # Contextes React
  AuthContext.tsx        # Authentification + session
  TourneeContext.tsx     # Donnees de tournee + mutations
constants/              # Constantes
  colors.ts             # Theme (light/dark) KoliGo
  labels.ts             # Labels FR (statuts, incidents, priorites)
hooks/                  # Hooks personnalises
  useAppTheme.ts        # Hook pour le theme
services/               # Services API
  api.ts                # Service API centralise
shared/                 # Types partages frontend/backend
  schema.ts             # Tous les types TypeScript (Parcel, Tour, Driver, etc.)
server/                 # Backend Express
  index.ts              # Setup serveur
  routes.ts             # Routes API REST
  data/mock-data.ts     # Donnees mock realistes
```

### API Endpoints
- POST /api/auth/login - Authentification livreur
- GET /api/tour/:driverId - Recuperer la tournee du jour
- GET /api/tour/:driverId/stats - Statistiques de la tournee
- GET /api/tour/:driverId/parcel/:parcelId - Detail d'un colis
- PUT /api/tour/:driverId/parcel/:parcelId/status - Mise a jour statut
- POST /api/tour/:driverId/parcel/:parcelId/deliver - Valider livraison avec preuve
- POST /api/tour/:driverId/parcel/:parcelId/incident - Signaler un incident
- POST /api/tour/:driverId/start - Demarrer la tournee

### Comptes de test
- Identifiant: KLG-1001, mot de passe: 1234 (Youssef Benali)
- Identifiant: KLG-1002, mot de passe: 1234 (Sophie Martin)

## Recent Changes
- 2026-02-24: Architecture globale initialisee - types, API, navigation, contextes, composants
- 2026-02-24: Implementation de la persistance locale des colis avec AsyncStorage

---

## 📦 Gestion des Données et Persistance Locale

### Architecture de Récupération des Colis

L'application implémente une architecture à trois niveaux pour la gestion des données des colis :

#### 1️⃣ Source de Vérité (Remote API)
- **Endpoint principal**: `GET /api/tour/:driverId`
- **Déclenchement**: Au lancement de l'app après authentification
- **Technologie**: React Query (TanStack Query) pour la gestion du cache et des requêtes
- **Refresh**: Automatique + manuel via Pull-to-Refresh

#### 2️⃣ Cache en Mémoire (React Query)
- **Durée**: Pendant toute la session de l'app
- **Invalidation**: Automatique après mutations (livraison, incident)
- **Avantage**: Accès instantané aux données sans requête réseau

#### 3️⃣ Persistance Locale (AsyncStorage)
- **Clé de stockage**: `@koligo_tour`
- **Format**: JSON stringifié de l'objet `Tour`
- **Synchronisation**: Automatique après chaque modification
- **Isolation**: Données filtrées par `driverId` pour éviter les mélanges entre comptes

### Flux de Données Détaillé

```
┌─────────────────────────────────────────────────────────────┐
│                    LANCEMENT DE L'APP                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │   Authentification Réussie    │
            │   (driver.id récupéré)        │
            └───────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                ▼                      ▼
    ┌──────────────────────┐   ┌─────────────────────┐
    │  Chargement Cache    │   │  Requête API        │
    │  AsyncStorage        │   │  GET /api/tour/...  │
    │  (si disponible)     │   │  (en arrière-plan)  │
    └──────────────────────┘   └─────────────────────┘
                │                      │
                ▼                      ▼
    ┌──────────────────────┐   ┌─────────────────────┐
    │  Affichage           │   │  Données API        │
    │  INSTANTANÉ          │   │  reçues             │
    │  (< 100ms)           │   │                     │
    └──────────────────────┘   └─────────────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  Sauvegarde dans    │
                            │  AsyncStorage       │
                            │  + Cache React Query│
                            └─────────────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  UI mise à jour     │
                            │  (si différences)   │
                            └─────────────────────┘
```

### Synchronisation lors des Mutations

Chaque action de l'utilisateur déclenche une mise à jour triple :

```typescript
// Exemple: Livraison d'un colis
Utilisateur valide la livraison
    │
    ▼
┌─────────────────────────────────────┐
│  1. Appel API                       │
│  POST /api/tour/.../deliver         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  2. Mise à jour Cache React Query   │
│  queryClient.setQueryData(...)      │
│  → UI mise à jour INSTANTANÉMENT    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  3. Sauvegarde AsyncStorage         │
│  await saveTourToStorage(...)       │
│  → Persistance pour prochain launch │
└─────────────────────────────────────┘
```

### Implémentation Technique (TourneeContext.tsx)

#### Chargement Initial
```typescript
// Au montage du composant, charger le cache si disponible
useEffect(() => {
  if (!driverId) return;

  const loadStoredTour = async () => {
    const stored = await AsyncStorage.getItem('@koligo_tour');
    if (stored) {
      const cachedTour = JSON.parse(stored);
      // Vérifier que le cache correspond au driver actuel
      if (cachedTour.driverId === driverId) {
        queryClient.setQueryData(['tour', driverId], cachedTour);
      }
    }
  };

  loadStoredTour();
}, [driverId, queryClient]);
```

#### Récupération depuis l'API
```typescript
const tourQuery = useQuery({
  queryKey: ['tour', driverId],
  queryFn: async () => {
    const tour = await apiService.getTour(driverId!, token);
    // Sauvegarde automatique après chaque fetch
    await saveTourToStorage(tour);
    return tour;
  },
  enabled: !!driverId,
});
```

#### Synchronisation après Livraison
```typescript
const deliverMutation = useMutation({
  mutationFn: ({ parcelId, proof }) =>
    apiService.deliverParcel(driverId!, parcelId, proof, token),
  onSuccess: async (updatedParcel) => {
    // 1. Mettre à jour le cache React Query immédiatement
    const currentTour = queryClient.getQueryData(['tour', driverId]);
    if (currentTour) {
      const updatedTour = {
        ...currentTour,
        parcels: currentTour.parcels.map(p =>
          p.id === updatedParcel.id ? updatedParcel : p
        ),
      };
      queryClient.setQueryData(['tour', driverId], updatedTour);
      
      // 2. Persister dans AsyncStorage
      await saveTourToStorage(updatedTour);
    }
    
    // 3. Invalider pour re-fetch en arrière-plan
    void queryClient.invalidateQueries({ queryKey: ['tour', driverId] });
  },
});
```

### Avantages de cette Architecture

✅ **Performance**: Affichage instantané grâce au cache (< 100ms)  
✅ **Expérience Utilisateur**: Pas d'écran blanc au lancement  
✅ **Fiabilité**: Données disponibles même en cas de problème réseau temporaire  
✅ **Synchronisation**: Mises à jour en temps réel après chaque action  
✅ **Isolation**: Pas de mélange de données entre différents livreurs  
✅ **Robustesse**: Gestion d'erreur complète avec try-catch  

### Gestion des Erreurs

```typescript
// Sauvegarde sécurisée
const saveTourToStorage = async (tour: Tour) => {
  try {
    await AsyncStorage.setItem('@koligo_tour', JSON.stringify(tour));
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    // L'app continue de fonctionner même si le cache échoue
  }
};
```

### Tests de Validation

Pour tester la fonctionnalité de persistance :

1. **Test de première connexion**: Vérifier le chargement depuis l'API
2. **Test de reconnexion**: Vérifier l'affichage instantané depuis le cache
3. **Test de changement de compte**: Vérifier l'isolation des données
4. **Test de livraison**: Vérifier la synchronisation triple
5. **Test hors-ligne**: Vérifier la disponibilité des données cached

Voir `TESTS_MANUELS.md` pour les procédures détaillées.

### Monitoring et Debugging

Pour inspecter le cache AsyncStorage :

```javascript
// Dans React Native Debugger ou Chrome DevTools
AsyncStorage.getAllKeys().then(console.log);
AsyncStorage.getItem('@koligo_tour').then(data => console.log(JSON.parse(data)));
```

---

## User Preferences
- Langue: Francais
- Style: TypeScript strict, architecture structuree (components, services, hooks, constants)
