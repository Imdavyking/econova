import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import tweetRoutes from "../routes/tweets.routes";
import logger from "../config/logger";
import llmRoutes from "../routes/llm.routes";
import { JWT_SECRET_KEY } from "../middlewares/auth";
import cors from "cors";
import session from "express-session";
import twitterRoutes from "../routes/twitter.routes";
import userRoutes from "../routes/user.routes";
import cookieParser from "cookie-parser";
import { FRONTEND_URL } from "../utils/constants";
import merkleRoutes from "../routes/merkle.routes";
import alloraRoutes from "../routes/allora.routes";
import sourceCodeRoutes from "../routes/source.code.routes";
import { environment } from "./config";
import coinGeckoPriceRoutes from "../routes/coin.gecko.routes";

dotenv.config();
const app = express();

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: environment.NODE_ENV === "production",
    },
  })
);

app.use(cookieParser());

// Middleware
app.use(express.json({ limit: "50mb" }));

// cors
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      const allowedOrigins = [
        new URL(FRONTEND_URL!).origin,
        new URL("http://localhost:3000").origin,
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Routes
app.use("/api/tweets", tweetRoutes);
app.use("/api/llm", llmRoutes);
app.use("/twitter", twitterRoutes);
app.use("/api/user", userRoutes);
app.use("/api/merkle", merkleRoutes);
app.use("/api/allora", alloraRoutes);
app.use("/api/source-code", sourceCodeRoutes);
app.use("/api/coin-gecko-price", coinGeckoPriceRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send("Something went wrong!");
});

export default app;
