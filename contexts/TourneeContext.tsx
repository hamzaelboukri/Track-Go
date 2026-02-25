import React, { createContext, useContext, useMemo, ReactNode, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { storageService } from "@/services/storage";
import { useAuth } from "./AuthContext";
import type { Tour, TourStats, Parcel, DeliveryProof, IncidentTypeValue, GeoCoordinates } from "../shared/schema";

interface TourneeContextValue {
  tour: Tour | null;
  stats: TourStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  isOffline: boolean;
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
  const [isOffline, setIsOffline] = React.useState(false);

  // Charger les données depuis le cache au démarrage
  useEffect(() => {
    if (!driverId) return;

    const loadCachedTour = async () => {
      try {
        const cachedTour = await storageService.getTour();
        if (cachedTour && cachedTour.driverId === driverId) {
          queryClient.setQueryData(["tour", driverId], cachedTour);
        }
      } catch (error) {
        console.error("Erreur chargement cache:", error);
      }
    };

    loadCachedTour();
  }, [driverId, queryClient]);

  const tourQuery = useQuery<Tour>({
    queryKey: ["tour", driverId],
    queryFn: async () => {
      try {
        setIsOffline(false);
        const tour = await apiService.getTour(driverId!, token || undefined);
        await storageService.saveTour(tour);
        return tour;
      } catch (error) {
        setIsOffline(true);
        // Fallback sur le cache en cas d'erreur réseau
        const cachedTour = await storageService.getTour();
        if (cachedTour && cachedTour.driverId === driverId) {
          return cachedTour;
        }
        throw error;
      }
    },
    enabled: !!driverId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const statsQuery = useQuery<TourStats>({
    queryKey: ["tour-stats", driverId],
    queryFn: () => apiService.getTourStats(driverId!, token || undefined),
    enabled: !!driverId && !isOffline,
  });

  const updateTourCache = useCallback(async (updatedParcel: Parcel) => {
    const currentTour = queryClient.getQueryData<Tour>(["tour", driverId]);
    if (currentTour) {
      const updatedTour = {
        ...currentTour,
        parcels: currentTour.parcels.map((p) =>
            p.id === updatedParcel.id ? updatedParcel : p
        ),
      };
      queryClient.setQueryData(["tour", driverId], updatedTour);
      await storageService.saveTour(updatedTour);
    }
  }, [driverId, queryClient]);

  const deliverMutation = useMutation({
    mutationFn: ({ parcelId, proof }: { parcelId: string; proof: DeliveryProof }) =>
        apiService.deliverParcel(driverId!, parcelId, proof, token || undefined),
    onSuccess: async (updatedParcel) => {
      await updateTourCache(updatedParcel);
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
      await updateTourCache(updatedParcel);
      void queryClient.invalidateQueries({ queryKey: ["tour", driverId] });
      void queryClient.invalidateQueries({ queryKey: ["tour-stats", driverId] });
    },
  });

  const startTourMutation = useMutation({
    mutationFn: () => apiService.startTour(driverId!, token || undefined),
    onSuccess: async (updatedTour) => {
      queryClient.setQueryData(["tour", driverId], updatedTour);
      await storageService.saveTour(updatedTour);
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
        isOffline,
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
      [tourQuery.data, statsQuery.data, tourQuery.isLoading, statsQuery.isLoading, tourQuery.isRefetching, statsQuery.isRefetching, tourQuery.error, statsQuery.error, isOffline, getParcelById, refetch, deliverMutation, incidentMutation, startTourMutation]
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
