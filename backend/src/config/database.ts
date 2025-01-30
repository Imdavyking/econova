import dotenv from "dotenv";
dotenv.config();

export const dbConfig = { url: process.env.MONGO_URI };
export const REDIS_CACHE_TIME = 900; // 15 * 60 -> 15 minutes
