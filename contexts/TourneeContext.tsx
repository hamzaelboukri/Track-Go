import React, { createContext, useContext, useMemo, ReactNode, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "@/services/api";
import { useAuth } from "./AuthContext";
import type { Tour, TourStats, Parcel, DeliveryProof, IncidentTypeValue, GeoCoordinates } from "../shared/schema";

const TOUR_STORAGE_KEY = "@koligo_tour";

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

  // Fonction pour sauvegarder la tournée dans AsyncStorage
  const saveTourToStorage = useCallback(async (tour: Tour) => {
    try {
      await AsyncStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tour));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tournée:", error);
    }
  }, []);

  // Charger les données depuis AsyncStorage au démarrage
  useEffect(() => {
    if (!driverId) return;

    const loadStoredTour = async () => {
      try {
        const stored = await AsyncStorage.getItem(TOUR_STORAGE_KEY);
        if (stored) {
          const cachedTour = JSON.parse(stored) as Tour;
          // Utiliser les données en cache si elles correspondent au même driver
          if (cachedTour.driverId === driverId) {
            queryClient.setQueryData(["tour", driverId], cachedTour);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la tournée:", error);
      }
    };

    loadStoredTour();
  }, [driverId, queryClient]);

  const tourQuery = useQuery<Tour>({
    queryKey: ["tour", driverId],
    queryFn: async () => {
      const tour = await apiService.getTour(driverId!, token || undefined);
      // Sauvegarder automatiquement dans AsyncStorage
      await saveTourToStorage(tour);
      return tour;
    },
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
    onSuccess: async (updatedParcel) => {
      // Mettre à jour le cache local immédiatement
      const currentTour = queryClient.getQueryData<Tour>(["tour", driverId]);
      if (currentTour) {
        const updatedTour = {
          ...currentTour,
          parcels: currentTour.parcels.map((p) =>
            p.id === updatedParcel.id ? updatedParcel : p
          ),
        };
        queryClient.setQueryData(["tour", driverId], updatedTour);
        await saveTourToStorage(updatedTour);
      }
      void queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      void queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
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
    onSuccess: async (updatedParcel) => {
      // Mettre à jour le cache local immédiatement
      const currentTour = queryClient.getQueryData<Tour>(["tour", driverId]);
      if (currentTour) {
        const updatedTour = {
          ...currentTour,
          parcels: currentTour.parcels.map((p) =>
            p.id === updatedParcel.id ? updatedParcel : p
          ),
        };
        queryClient.setQueryData(["tour", driverId], updatedTour);
        await saveTourToStorage(updatedTour);
      }
      void queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      void queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
    },
  });

  const startTourMutation = useMutation({
    mutationFn: () => apiService.startTour(driverId!, token || undefined),
    onSuccess: async (updatedTour) => {
      queryClient.setQueryData(["tour", driverId], updatedTour);
      await saveTourToStorage(updatedTour);
      void queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      void queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
    },
  });

  const refetch = useCallback(() => {
    tourQuery.refetch();
    statsQuery.refetch();
  }, [tourQuery, statsQuery]);

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
    [tourQuery.data, statsQuery.data, tourQuery.isLoading, statsQuery.isLoading, tourQuery.isRefetching, statsQuery.isRefetching, tourQuery.error, statsQuery.error, getParcelById, refetch, deliverMutation, incidentMutation, startTourMutation]
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
