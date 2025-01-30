import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import tweetRoutes from "./routes/tweets.routes";
import logger from "./config/logger";
import llmRoutes from "./routes/llm.routes";
import { auth } from "./middlewares/auth";
import cors from "cors";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// cors
app.use(cors());

// Database connection
connectDB();

// Routes
app.use("/api/tweets", tweetRoutes);
// app.use("/api/llm", auth, llmRoutes);
app.use("/api/llm", llmRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
