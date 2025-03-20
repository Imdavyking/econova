import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import logger from "./config/logger";
import { automateCharityFundDistribution } from "./services/automate.services";
import { environment } from "./utils/config";
import initializeRedis from "./utils/redis.app";
import server from "./utils/create.server";

dotenv.config();

// Database connection
connectDB();

// Initialize Redis
initializeRedis();

// Automation for funds distrubtion
automateCharityFundDistribution();

// Start the server
const PORT = environment.PORT || 3000;

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
