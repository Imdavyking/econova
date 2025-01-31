import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import tweetRoutes from "./routes/tweets.routes";
import logger from "./config/logger";
import llmRoutes from "./routes/llm.routes";
import { auth, JWT_SECRET_KEY } from "./middlewares/auth";
import cors from "cors";
import session from "express-session";
import twitterRoutes from "./routes/twitter.routes";

dotenv.config();
const app = express();

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: JWT_SECRET_KEY, // Use a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Make cookies accessible only through HTTP
      secure: process.env.NODE_ENV === "production", // Use Secure cookies in production
      sameSite: "none", // Important for cross-origin requests
    },
  })
);

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

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
