import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { voteSchema, type MealType } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current status
  app.get("/api/status", async (_req, res) => {
    try {
      const status = await storage.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // Submit vote
  app.post("/api/vote", async (req, res) => {
    try {
      const result = voteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid vote data" });
      }

      const { name, meal } = result.data;
      const status = await storage.vote(name, meal);
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to vote" });
    }
  });

  // Reset specific meal
  app.post("/api/reset/:meal", async (req, res) => {
    try {
      const meal = req.params.meal as MealType;
      if (!["Breakfast", "Lunch", "Dinner"].includes(meal)) {
        return res.status(400).json({ error: "Invalid meal type" });
      }

      const status = await storage.resetMeal(meal);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset meal" });
    }
  });

  // Reset all meals
  app.post("/api/reset-all", async (_req, res) => {
    try {
      const status = await storage.resetAll();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset all meals" });
    }
  });

  // Get preset names
  app.get("/api/preset-names", async (_req, res) => {
    try {
      const names = await storage.getPresetNames();
      res.json(names);
    } catch (error) {
      res.status(500).json({ error: "Failed to get names" });
    }
  });

  // Add name
  app.post("/api/names", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Name is required" });
      }
      const names = await storage.addName(name);
      res.json(names);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to add name" });
    }
  });

  // Update name
  app.put("/api/names/:oldName", async (req, res) => {
    try {
      const { oldName } = req.params;
      const { newName } = req.body;
      if (!newName || typeof newName !== "string") {
        return res.status(400).json({ error: "New name is required" });
      }
      const names = await storage.updateName(decodeURIComponent(oldName), newName);
      res.json(names);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update name" });
    }
  });

  // Delete name
  app.delete("/api/names/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const names = await storage.deleteName(decodeURIComponent(name));
      res.json(names);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to delete name" });
    }
  });

  // Export CSV
  app.get("/api/export-csv", async (_req, res) => {
    try {
      const csv = await storage.exportCSV();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=hostelbites_attendance.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Backup files
  app.get("/api/backup-files", async (_req, res) => {
    try {
      const backup = await storage.getBackupData();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=hostelbites_backup.json");
      res.json(backup);
    } catch (error) {
      res.status(500).json({ error: "Failed to backup files" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
