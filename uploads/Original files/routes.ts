import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoldRateSchema, insertDisplaySettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Gold Rates API
  app.get("/api/rates/current", async (req, res) => {
    try {
      const rates = await storage.getCurrentRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching current rates:", error);
      res.status(500).json({ error: "Failed to fetch current rates" });
    }
  });

  app.post("/api/rates", async (req, res) => {
    try {
      const validatedData = insertGoldRateSchema.parse(req.body);
      const newRate = await storage.createGoldRate(validatedData);
      res.json(newRate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid rate data", details: error.errors });
      } else {
        console.error("Error creating rate:", error);
        res.status(500).json({ error: "Failed to create rate" });
      }
    }
  });

  // Display Settings API
  app.get("/api/settings/display", async (req, res) => {
    try {
      const settings = await storage.getDisplaySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching display settings:", error);
      res.status(500).json({ error: "Failed to fetch display settings" });
    }
  });

  app.put("/api/settings/display/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDisplaySettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateDisplaySettings(id, validatedData);
      
      if (!updatedSettings) {
        res.status(404).json({ error: "Display settings not found" });
        return;
      }
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid settings data", details: error.errors });
      } else {
        console.error("Error updating display settings:", error);
        res.status(500).json({ error: "Failed to update display settings" });
      }
    }
  });

  // Media Items API
  app.get("/api/media", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const mediaItems = await storage.getMediaItems(activeOnly);
      res.json(mediaItems);
    } catch (error) {
      console.error("Error fetching media items:", error);
      res.status(500).json({ error: "Failed to fetch media items" });
    }
  });

  // Promo Images API
  app.get("/api/promo", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const promoImages = await storage.getPromoImages(activeOnly);
      res.json(promoImages);
    } catch (error) {
      console.error("Error fetching promo images:", error);
      res.status(500).json({ error: "Failed to fetch promo images" });
    }
  });

  // Banner Settings API
  app.get("/api/banner", async (req, res) => {
    try {
      const banner = await storage.getBannerSettings();
      res.json(banner);
    } catch (error) {
      console.error("Error fetching banner settings:", error);
      res.status(500).json({ error: "Failed to fetch banner settings" });
    }
  });

  // System Info API
  app.get("/api/system/info", async (req, res) => {
    try {
      res.json({
        status: "active",
        server_time: new Date().toISOString(),
        refresh_interval: 30
      });
    } catch (error) {
      console.error("Error fetching system info:", error);
      res.status(500).json({ error: "Failed to fetch system info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
