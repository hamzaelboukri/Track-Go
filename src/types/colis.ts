export type ColisStatus = 'PENDING' | 'DELIVERED' | 'INCIDENT';

export interface Colis {
  id: string;
  clientName: string;
  address: string;
  lat: number;
  lng: number;
  barcode: string;
  status: ColisStatus;
  deliveredAt?: string;
  proofPhoto?: string;
}
