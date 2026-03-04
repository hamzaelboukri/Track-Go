import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { mockDrivers, getMockTour } from "./data/mock-data";
import type { Tour, DeliveryProof, Incident, IncidentTypeValue } from "../shared/schema";

const activeTours = new Map<string, Tour>();

// Configuration multer pour le stockage des fichiers
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === "photo" ? "photos" : "signatures";
    const targetDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé"));
    }
  },
});

function normalizeBarcode(value: string | undefined): string {
  return (value || "").trim().replace(/\s+/g, "").toUpperCase();
}

function getOrCreateTour(driverId: string): Tour {
  const today = new Date().toISOString().split("T")[0];
  const key = `${driverId}-${today}`;
  if (!activeTours.has(key)) {
    activeTours.set(key, getMockTour(driverId));
  }
  return activeTours.get(key)!;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir les fichiers uploadés
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "Fichier non trouvé" });
    }
  });

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
    const driverId = req.params.driverId as string;
    const driver = mockDrivers.find((d) => d.id === driverId);
    if (!driver) {
      return res.status(404).json({ message: "Livreur non trouve" });
    }
    return res.json(driver);
  });

  app.get("/api/tour/:driverId", (req: Request, res: Response) => {
    const driverId = req.params.driverId as string;
    const tour = getOrCreateTour(driverId);
    return res.json(tour);
  });

  app.get("/api/tour/:driverId/stats", (req: Request, res: Response) => {
    const driverId = req.params.driverId as string;
    const tour = getOrCreateTour(driverId);
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
    const driverId = req.params.driverId as string;
    const parcelId = req.params.parcelId as string;
    const tour = getOrCreateTour(driverId);
    const parcel = tour.parcels.find((p) => p.id === parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Colis non trouve" });
    }
    return res.json(parcel);
  });

  app.put("/api/tour/:driverId/parcel/:parcelId/status", (req: Request, res: Response) => {
    const driverId = req.params.driverId as string;
    const parcelId = req.params.parcelId as string;
    const tour = getOrCreateTour(driverId);
    const parcel = tour.parcels.find((p) => p.id === parcelId);
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
    const driverId = req.params.driverId as string;
    const parcelId = req.params.parcelId as string;
    const tour = getOrCreateTour(driverId);
    const parcel = tour.parcels.find((p) => p.id === parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Colis non trouve" });
    }
    const proof: DeliveryProof = req.body;
    if (!proof.scannedBarcode || !proof.coordinates) {
      return res.status(400).json({ message: "Preuve de livraison incomplete" });
    }
    if (normalizeBarcode(proof.scannedBarcode) !== normalizeBarcode(parcel.barcode)) {
      return res.status(400).json({
        message: "Code-barres ne correspond pas au colis",
        expectedBarcode: parcel.barcode,
        scannedBarcode: proof.scannedBarcode,
      });
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
    const driverId = req.params.driverId as string;
    const parcelId = req.params.parcelId as string;
    const tour = getOrCreateTour(driverId);
    const parcel = tour.parcels.find((p) => p.id === parcelId);
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
    const driverId = req.params.driverId as string;
    const tour = getOrCreateTour(driverId);
    if (tour.status === "not_started") {
      tour.status = "in_progress";
      tour.startTime = new Date().toISOString();
    }
    return res.json(tour);
  });

  app.post("/api/location/track", (req: Request, res: Response) => {
    const { latitude, longitude, accuracy, altitude, heading, speed, timestamp } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude et longitude requises" });
    }

    console.log('[Location Track]', {
      lat: latitude.toFixed(6),
      lng: longitude.toFixed(6),
      accuracy: accuracy ? `${accuracy.toFixed(1)}m` : 'N/A',
      speed: speed ? `${(speed * 3.6).toFixed(1)} km/h` : 'N/A',
      time: new Date(timestamp).toLocaleTimeString('fr-FR'),
    });

    return res.json({ 
      success: true, 
      message: 'Position enregistrée',
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/upload/delivery-photo", upload.single("photo"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
      }

      const { parcelId, driverId, timestamp, width, height, fileSize } = req.body;

      console.log("[Photo Upload]", {
        parcelId,
        driverId,
        timestamp: new Date(timestamp).toLocaleTimeString("fr-FR"),
        size: `${width}x${height}`,
        fileSize: `${Math.round(fileSize / 1024)} KB`,
        savedAs: req.file.filename,
      });

      // URL accessible pour récupérer la photo
      const photoUrl = `/uploads/photos/${req.file.filename}`;

      return res.json({
        success: true,
        message: "Photo uploadée avec succès",
        photoUrl,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Photo Upload Error]", error);
      return res.status(500).json({ message: error.message || "Erreur upload photo" });
    }
  });

  app.post("/api/upload/signature", upload.single("signature"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier reçu" });
      }

      const { parcelId, driverId, timestamp, signerName } = req.body;

      console.log("[Signature Upload]", {
        parcelId,
        driverId,
        signerName,
        timestamp: new Date(timestamp).toLocaleTimeString("fr-FR"),
        savedAs: req.file.filename,
      });

      // URL accessible pour récupérer la signature
      const signatureUrl = `/uploads/signatures/${req.file.filename}`;

      return res.json({
        success: true,
        message: "Signature uploadée avec succès",
        signatureUrl,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Signature Upload Error]", error);
      return res.status(500).json({ message: error.message || "Erreur upload signature" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
