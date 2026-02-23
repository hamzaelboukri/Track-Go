import { Colis, ColisStatus } from '../types/colis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useReducer } from 'react';

export type TourneeState = {
  colis: Colis[];
};

export type TourneeAction =
  | { type: 'SET_COLIS'; payload: Colis[] }
  | { type: 'DELIVER_COLIS'; payload: { id: string; deliveredAt: string; proofPhoto: string; lat: number; lng: number } }
  | { type: 'REPORT_INCIDENT'; payload: { id: string; reason: string; proofPhoto?: string } };

const initialState: TourneeState = { colis: [] };

function tourneeReducer(state: TourneeState, action: TourneeAction): TourneeState {
  switch (action.type) {
    case 'SET_COLIS':
      return { ...state, colis: action.payload };
    case 'DELIVER_COLIS':
      return {
        ...state,
        colis: state.colis.map(colis =>
          colis.id === action.payload.id
            ? {
                ...colis,
                status: 'DELIVERED',
                deliveredAt: action.payload.deliveredAt,
                proofPhoto: action.payload.proofPhoto,
                lat: action.payload.lat,
                lng: action.payload.lng,
              }
            : colis
        ),
      };
    case 'REPORT_INCIDENT':
      return {
        ...state,
        colis: state.colis.map(colis =>
          colis.id === action.payload.id
            ? {
                ...colis,
                status: 'INCIDENT',
                proofPhoto: action.payload.proofPhoto,
              }
            : colis
        ),
      };
    default:
      return state;
  }
}

const STORAGE_KEY = 'tournee_state';

export function useTourneeReducer() {
  const [state, dispatch] = useReducer(tourneeReducer, initialState);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatch({ type: 'SET_COLIS', payload: JSON.parse(stored) });
      }
    })();
  }, []);

  // Sync to AsyncStorage on state change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.colis));
  }, [state.colis]);

  return [state, dispatch] as const;
}
