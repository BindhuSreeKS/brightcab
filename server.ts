import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { User, Ride, SystemLog } from "./src/models.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.warn("MONGODB_URI not found in environment. Database features will be disabled.");
  }

  app.use(cors());
  // Removed global express.json() to prevent body consumption before proxying
  // app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
  });

  // Admin Dashboard Routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const totalRides = await Ride.countDocuments();
        const activeDrivers = await User.countDocuments({ role: 'DRIVER', status: 'ACTIVE' });
        const rides = await Ride.find().sort({ createdAt: -1 }).limit(10);
        
        // Calculate total revenue
        const revenueResult = await Ride.aggregate([
          { $match: { status: 'COMPLETED' } },
          { $group: { _id: null, total: { $sum: '$fare' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        res.json({
          totalRides,
          activeDrivers,
          totalRevenue,
          customerSatisfaction: 4.8,
          recentRides: rides
        });
      } else {
        // Fallback to mock data if DB is not connected
        res.json({
          totalRides: 1250,
          activeDrivers: 42,
          totalRevenue: 45200,
          customerSatisfaction: 4.8,
          recentRides: [] 
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Super Admin Monitoring Routes
  app.get("/api/super-admin/monitoring", async (req, res) => {
    try {
      const logs = mongoose.connection.readyState === 1 
        ? await SystemLog.find().sort({ timestamp: -1 }).limit(20)
        : [];
      
      res.json({
        services: [
          { name: "Auth Service", status: "Healthy", uptime: "14d 6h" },
          { name: "Payment Gateway", status: "Healthy", uptime: "30d 12h" },
          { name: "Map API", status: "Healthy", uptime: "125d 2h" },
          { name: "Notification Engine", status: "Warning", uptime: "2h 15m" }
        ],
        recentLogs: logs,
        dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch monitoring data" });
    }
  });

  // Proxy unmatched API requests to Spring Boot backend
  app.use("/api", (req, res) => {
    const targetUrl = `http://localhost:8080${req.originalUrl}`;
    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err);
      res.status(502).json({ error: "Bad Gateway (Backend might be offline)" });
    });

    req.pipe(proxyReq, { end: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          ignored: ['**/backend/**'],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
