import React, { createContext, useContext, useMemo, ReactNode, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { useAuth } from "./AuthContext";
import type { Tour, TourStats, Parcel, DeliveryProof, IncidentTypeValue, GeoCoordinates } from "../shared/schema";

interface TourneeContextValue {
  tour: Tour | null;
  stats: TourStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refetch: () => void;
  deliverParcel: (parcelId: string, proof: DeliveryProof) => Promise<Parcel>;
  reportIncident: (
    parcelId: string,
    data: { type: IncidentTypeValue; description: string; photoUri?: string; coordinates?: GeoCoordinates }
  ) => Promise<Parcel>;
  startTour: () => Promise<Tour>;
  getParcelById: (parcelId: string) => Parcel | undefined;
}

const TourneeContext = createContext<TourneeContextValue | null>(null);

export function TourneeProvider({ children }: { children: ReactNode }) {
  const { driver, token } = useAuth();
  const queryClient = useQueryClient();
  const driverId = driver?.id;

  const tourQuery = useQuery<Tour>({
    queryKey: ["tour", driverId],
    queryFn: () => apiService.getTour(driverId!, token || undefined),
    enabled: !!driverId,
  });

  const statsQuery = useQuery<TourStats>({
    queryKey: ["tour-stats", driverId],
    queryFn: () => apiService.getTourStats(driverId!, token || undefined),
    enabled: !!driverId,
  });

  const deliverMutation = useMutation({
    mutationFn: ({ parcelId, proof }: { parcelId: string; proof: DeliveryProof }) =>
      apiService.deliverParcel(driverId!, parcelId, proof, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
    },
  });

  const incidentMutation = useMutation({
    mutationFn: ({
      parcelId,
      data,
    }: {
      parcelId: string;
      data: { type: IncidentTypeValue; description: string; photoUri?: string; coordinates?: GeoCoordinates };
    }) => apiService.reportIncident(driverId!, parcelId, data, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
    },
  });

  const startTourMutation = useMutation({
    mutationFn: () => apiService.startTour(driverId!, token || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
    },
  });

  const refetch = useCallback(() => {
    tourQuery.refetch();
    statsQuery.refetch();
  }, []);

  const getParcelById = useCallback(
    (parcelId: string) => tourQuery.data?.parcels.find((p) => p.id === parcelId),
    [tourQuery.data]
  );

  const value = useMemo(
    () => ({
      tour: tourQuery.data || null,
      stats: statsQuery.data || null,
      isLoading: tourQuery.isLoading || statsQuery.isLoading,
      isRefreshing: tourQuery.isRefetching || statsQuery.isRefetching,
      error: tourQuery.error || statsQuery.error,
      refetch,
      deliverParcel: (parcelId: string, proof: DeliveryProof) =>
        deliverMutation.mutateAsync({ parcelId, proof }),
      reportIncident: (
        parcelId: string,
        data: { type: IncidentTypeValue; description: string; photoUri?: string; coordinates?: GeoCoordinates }
      ) => incidentMutation.mutateAsync({ parcelId, data }),
      startTour: () => startTourMutation.mutateAsync(),
      getParcelById,
    }),
    [tourQuery.data, statsQuery.data, tourQuery.isLoading, statsQuery.isLoading, tourQuery.isRefetching, statsQuery.isRefetching, tourQuery.error, statsQuery.error, getParcelById]
  );

  return <TourneeContext.Provider value={value}>{children}</TourneeContext.Provider>;
}

export function useTournee(): TourneeContextValue {
  const context = useContext(TourneeContext);
  if (!context) {
    throw new Error("useTournee must be used within TourneeProvider");
  }
  return context;
}
