import { z } from "zod";

export const ParcelStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  FAILED: "failed",
} as const;

export type ParcelStatusType = (typeof ParcelStatus)[keyof typeof ParcelStatus];

export const IncidentType = {
  ABSENT: "absent",
  DAMAGED: "damaged",
  WRONG_ADDRESS: "wrong_address",
  ACCESS_DENIED: "access_denied",
  OTHER: "other",
} as const;

export type IncidentTypeValue = (typeof IncidentType)[keyof typeof IncidentType];

export const loginSchema = z.object({
  employeeId: z.string().min(1, "Identifiant requis"),
  password: z.string().min(4, "Mot de passe requis (min 4 caracteres)"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface Driver {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleId: string;
  avatar?: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  coordinates: GeoCoordinates;
}

export interface Recipient {
  name: string;
  phone: string;
  email?: string;
}

export interface Parcel {
  id: string;
  trackingCode: string;
  barcode: string;
  status: ParcelStatusType;
  recipient: Recipient;
  address: Address;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  priority: "normal" | "express" | "urgent";
  notes?: string;
  deliveredAt?: string;
  deliveryProof?: DeliveryProof;
  incident?: Incident;
  order: number;
}

export interface DeliveryProof {
  timestamp: string;
  coordinates: GeoCoordinates;
  photoUri?: string;
  signatureUri?: string;
  scannedBarcode: string;
}

export interface Incident {
  id: string;
  type: IncidentTypeValue;
  description: string;
  photoUri?: string;
  timestamp: string;
  coordinates?: GeoCoordinates;
}

export interface Tour {
  id: string;
  driverId: string;
  date: string;
  parcels: Parcel[];
  startTime?: string;
  endTime?: string;
  status: "not_started" | "in_progress" | "completed";
}

export interface TourStats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  inProgress: number;
  progressPercent: number;
}

export interface AuthResponse {
  token: string;
  driver: Driver;
}
