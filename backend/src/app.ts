import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import tweetRoutes from "./routes/tweets.routes";
import logger from "./config/logger";
import llmRoutes from "./routes/llm.routes";
import { JWT_SECRET_KEY } from "./middlewares/auth";
import cors from "cors";
import session from "express-session";
import twitterRoutes from "./routes/twitter.routes";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: JWT_SECRET_KEY,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(cookieParser());

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
app.use("/twitter", twitterRoutes);
app.use("/api/user", userRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
