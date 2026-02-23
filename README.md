# Track&Go

Track&Go is a last-mile delivery management app for couriers, built with Expo, TypeScript, Expo Router, Axios, AsyncStorage, expo-camera, expo-location, react-native-maps, and NativeWind.

## Features
- Auth flow (login)
- Tab navigation: Tournée, Carte, Performance
- Stack navigation inside Tournée: Colis detail, Scan, Incident form
- Strongly typed Colis model
- Global state with useReducer, synced to AsyncStorage
- API layer with Axios
- FlatList with memoized items and getItemLayout
- Barcode scanning, GPS, and photo capture
- Offline fallback
- Minimal NativeWind styling

## Folder Structure
```
src/
  app/                # Expo Router screens
  components/
    ui/
    colis/
  services/
    api.ts
    colis.service.ts
  hooks/
    useTournee.ts
  store/
    tourneeReducer.ts
  types/
    colis.ts
  constants/
  utils/
```

## Getting Started
1. Install dependencies: `npm install`
2. Start the app: `npm run start`

## Notes
- Replace API URLs with your backend endpoints.
- Add your own icons and splash images in the assets folder.
- NativeWind is used for styling (Tailwind CSS for React Native).
