import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import logger from "./config/logger";
import { automateCharityFundDistribution } from "./services/automate.services";
import app from "./utils/create.server";
import { environment } from "./utils/config";
import initializeRedis from "./utils/redis.app";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

// Database connection
connectDB();

// Initialize Redis
initializeRedis();

// Automation for funds distrubtion
automateCharityFundDistribution();

// Start the server
const PORT = environment.PORT || 3000;
app.use(
  "/pinata",
  createProxyMiddleware({
    target: "https://emerald-odd-bee-965.mypinata.cloud",
    changeOrigin: true,
    pathRewrite: { "^/pinata": "/files" },
  })
);
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
