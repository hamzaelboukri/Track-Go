import type { ParcelStatusType, IncidentTypeValue } from "../shared/schema";

export const STATUS_LABELS: Record<ParcelStatusType, string> = {
  pending: "En attente",
  in_progress: "En cours",
  delivered: "Livre",
  failed: "Echec",
};

export const INCIDENT_LABELS: Record<IncidentTypeValue, string> = {
  absent: "Destinataire absent",
  damaged: "Colis endommage",
  wrong_address: "Mauvaise adresse",
  access_denied: "Acces refuse",
  other: "Autre",
};

export const PRIORITY_LABELS: Record<string, string> = {
  normal: "Normal",
  express: "Express",
  urgent: "Urgent",
};
