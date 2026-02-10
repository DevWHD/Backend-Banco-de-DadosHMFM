import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../src/config/swagger";
import foldersRouter from "../src/routes/folders";
import filesRouter from "../src/routes/files";
import uploadRouter from "../src/routes/upload";

// Load environment variables
dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ 
    message: "Hospital Document Explorer API", 
    version: "1.0.0",
    status: "running",
    docs: "/api-docs" 
  });
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Hospital Document Explorer API",
  customCss: ".swagger-ui .topbar { display: none }",
  explorer: true,
}));

// API Routes
app.use("/api/folders", foldersRouter);
app.use("/api/files", filesRouter);
app.use("/api/upload", uploadRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Export for Vercel serverless
export default app;
