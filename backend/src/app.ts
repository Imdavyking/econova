import dotenv from "dotenv";
import { connectDB } from "./database/connection";
import logger from "./config/logger";
import { automateCharityFundDistribution } from "./services/automate.services";
import app from "./utils/create.server";
import { environment } from "./utils/config";
import initializeRedis from "./utils/redis.app";
import { Server } from "socket.io";
import { createServer } from "http";
import { allowedOrigins } from "./utils/constants";

dotenv.config();

// Database connection
connectDB();

// Initialize Redis
initializeRedis();

// Automation for funds distrubtion
automateCharityFundDistribution();

// Start the server
const PORT = environment.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  logger.info(`user connected ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info("user disconnected");
  });
});

export { io };

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
