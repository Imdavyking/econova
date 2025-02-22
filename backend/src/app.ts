import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import logger from "./config/logger";
import { automateCharityFundDistribution } from "./services/automate.services";
import app from "./utils/create.server";

dotenv.config();

// Database connection
connectDB();

// Automation for funds distrubtion
automateCharityFundDistribution();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
