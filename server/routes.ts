import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { mockDrivers, getMockTour } from "./data/mock-data";
import type { Tour, Parcel, Incident, DeliveryProof } from "../shared/schema";

const activeTours = new Map<string, Tour>();

function getOrCreateTour(driverId: string): Tour {
  const today = new Date().toISOString().split("T")[0];
  const key = `${driverId}-${today}`;
  if (!activeTours.has(key)) {
    activeTours.set(key, getMockTour(driverId));
  }
  return activeTours.get(key)!;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
      return res.status(400).json({ message: "Identifiant et mot de passe requis" });
    }
    const driver = mockDrivers.find((d) => d.employeeId === employeeId);
    if (!driver) {
      return res.status(401).json({ message: "Identifiant inconnu" });
    }
    if (password.length < 4) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    return res.json({
      token: `mock-jwt-${driver.id}-${Date.now()}`,
      driver,
    });
  });

  app.get("/api/driver/:driverId", (req: Request, res: Response) => {
    const driver = mockDrivers.find((d) => d.id === req.params.driverId);
    if (!driver) {
      return res.status(404).json({ message: "Livreur non trouve" });
    }
    return res.json(driver);
  });

  app.get("/api/tour/:driverId", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    return res.json(tour);
  });

  app.get("/api/tour/:driverId/stats", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    const total = tour.parcels.length;
    const delivered = tour.parcels.filter((p) => p.status === "delivered").length;
    const failed = tour.parcels.filter((p) => p.status === "failed").length;
    const pending = tour.parcels.filter((p) => p.status === "pending").length;
    const inProgress = tour.parcels.filter((p) => p.status === "in_progress").length;
    return res.json({
      total,
      delivered,
      failed,
      pending,
      inProgress,
      progressPercent: total > 0 ? Math.round((delivered / total) * 100) : 0,
    });
  });

  app.get("/api/tour/:driverId/parcel/:parcelId", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    const parcel = tour.parcels.find((p) => p.id === req.params.parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Colis non trouve" });
    }
    return res.json(parcel);
  });

  app.put("/api/tour/:driverId/parcel/:parcelId/status", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    const parcel = tour.parcels.find((p) => p.id === req.params.parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Colis non trouve" });
    }
    const { status } = req.body;
    if (!["pending", "in_progress", "delivered", "failed"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    parcel.status = status;
    if (status === "delivered") {
      parcel.deliveredAt = new Date().toISOString();
    }

    const allDone = tour.parcels.every((p) => p.status === "delivered" || p.status === "failed");
    if (allDone) {
      tour.status = "completed";
      tour.endTime = new Date().toISOString();
    } else if (tour.status === "not_started") {
      tour.status = "in_progress";
      tour.startTime = new Date().toISOString();
    }

    return res.json(parcel);
  });

  app.post("/api/tour/:driverId/parcel/:parcelId/deliver", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    const parcel = tour.parcels.find((p) => p.id === req.params.parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Colis non trouve" });
    }
    const proof: DeliveryProof = req.body;
    if (!proof.scannedBarcode || !proof.coordinates) {
      return res.status(400).json({ message: "Preuve de livraison incomplete" });
    }
    if (proof.scannedBarcode !== parcel.barcode) {
      return res.status(400).json({ message: "Code-barres ne correspond pas au colis" });
    }
    parcel.status = "delivered";
    parcel.deliveredAt = new Date().toISOString();
    parcel.deliveryProof = { ...proof, timestamp: new Date().toISOString() };

    if (tour.status === "not_started") {
      tour.status = "in_progress";
      tour.startTime = new Date().toISOString();
    }
    const allDone = tour.parcels.every((p) => p.status === "delivered" || p.status === "failed");
    if (allDone) {
      tour.status = "completed";
      tour.endTime = new Date().toISOString();
    }

    return res.json(parcel);
  });

  app.post("/api/tour/:driverId/parcel/:parcelId/incident", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    const parcel = tour.parcels.find((p) => p.id === req.params.parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Colis non trouve" });
    }
    const incident: Incident = {
      ...req.body,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    parcel.status = "failed";
    parcel.incident = incident;

    if (tour.status === "not_started") {
      tour.status = "in_progress";
      tour.startTime = new Date().toISOString();
    }
    const allDone = tour.parcels.every((p) => p.status === "delivered" || p.status === "failed");
    if (allDone) {
      tour.status = "completed";
      tour.endTime = new Date().toISOString();
    }

    return res.json(parcel);
  });

  app.post("/api/tour/:driverId/start", (req: Request, res: Response) => {
    const tour = getOrCreateTour(req.params.driverId);
    if (tour.status === "not_started") {
      tour.status = "in_progress";
      tour.startTime = new Date().toISOString();
    }
    return res.json(tour);
  });

  const httpServer = createServer(app);
  return httpServer;
}
