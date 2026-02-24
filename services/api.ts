import { fetch } from "expo/fetch";
import { getApiUrl } from "@/lib/query-client";
import type {
  AuthResponse,
  LoginInput,
  Tour,
  TourStats,
  Parcel,
  DeliveryProof,
  IncidentTypeValue,
  GeoCoordinates,
} from "../shared/schema";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((errorData as { message?: string }).message || `Erreur ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiService = {
  login(input: LoginInput): Promise<AuthResponse> {
    return request<AuthResponse>("POST", "/api/auth/login", input);
  },

  getTour(driverId: string, token?: string): Promise<Tour> {
    return request<Tour>("GET", `/api/tour/${driverId}`, undefined, token);
  },

  getTourStats(driverId: string, token?: string): Promise<TourStats> {
    return request<TourStats>("GET", `/api/tour/${driverId}/stats`, undefined, token);
  },

  getParcel(driverId: string, parcelId: string, token?: string): Promise<Parcel> {
    return request<Parcel>("GET", `/api/tour/${driverId}/parcel/${parcelId}`, undefined, token);
  },

  updateParcelStatus(
    driverId: string,
    parcelId: string,
    status: string,
    token?: string
  ): Promise<Parcel> {
    return request<Parcel>(
      "PUT",
      `/api/tour/${driverId}/parcel/${parcelId}/status`,
      { status },
      token
    );
  },

  deliverParcel(
    driverId: string,
    parcelId: string,
    proof: DeliveryProof,
    token?: string
  ): Promise<Parcel> {
    return request<Parcel>(
      "POST",
      `/api/tour/${driverId}/parcel/${parcelId}/deliver`,
      proof,
      token
    );
  },

  reportIncident(
    driverId: string,
    parcelId: string,
    data: {
      type: IncidentTypeValue;
      description: string;
      photoUri?: string;
      coordinates?: GeoCoordinates;
    },
    token?: string
  ): Promise<Parcel> {
    return request<Parcel>(
      "POST",
      `/api/tour/${driverId}/parcel/${parcelId}/incident`,
      data,
      token
    );
  },

  startTour(driverId: string, token?: string): Promise<Tour> {
    return request<Tour>("POST", `/api/tour/${driverId}/start`, {}, token);
  },
};
