import { useTourneeReducer } from '../store/tourneeReducer';

export function useTournee() {
  const [state, dispatch] = useTourneeReducer();
  return { state, dispatch };
}
