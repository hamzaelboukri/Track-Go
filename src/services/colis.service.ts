import api from './api';
import { Colis } from '../types/colis';

export async function fetchColis(): Promise<Colis[]> {
  const { data } = await api.get<Colis[]>('/colis');
  return data;
}

export async function updateColis(id: string, updates: Partial<Colis>): Promise<Colis> {
  const { data } = await api.patch<Colis>(`/colis/${id}`, updates);
  return data;
}
