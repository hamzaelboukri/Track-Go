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

## User Preferences
- Langue: Francais
- Style: TypeScript strict, architecture structuree (components, services, hooks, constants)
