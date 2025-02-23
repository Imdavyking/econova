import dotenv from "dotenv";
import { environment } from "../utils/config";
dotenv.config();

export const dbConfig = { url: environment.MONGO_URI! };
export const REDIS_CACHE_TIME = 900; // 15 * 60 -> 15 minutes
