import { secret } from "./secret";
import dotenv from "dotenv";
dotenv.config();

export const environment = {
  MONGO_URI: secret.read("MONGO_URI"),
  TWITTER_CONSUMER_KEY: secret.read("TWITTER_CONSUMER_KEY"),
  TWITTER_CONSUMER_SECRET: secret.read("TWITTER_CONSUMER_SECRET"),
  TWITTER_ACCESS_TOKEN: secret.read("TWITTER_ACCESS_TOKEN"),
  TWITTER_ACCESS_TOKEN_SECRET: secret.read("TWITTER_ACCESS_TOKEN_SECRET"),
  TWITTER_USER_ID: secret.read("TWITTER_USER_ID"),
  TWITTER_BEARER_TOKEN: secret.read("TWITTER_BEARER_TOKEN"),
  REDIS_HOST: secret.read("REDIS_HOST"),
  REDIS_PORT: secret.read("REDIS_PORT"),
  REDIS_PASSWORD: secret.read("REDIS_PASSWORD"),
  NODE_ENV: secret.read("NODE_ENV") || "development",
  OPENAI_API_KEY: secret.read("OPENAI_API_KEY"),
  JWT_SECRET: secret.read("JWT_SECRET"),
  PORT: secret.read("PORT") || "3000",
  BOT_PRIVATE_KEY: secret.read("BOT_PRIVATE_KEY"),
  FRONTEND_URL: secret.read("FRONTEND_URL"),
  CHAIN_ID: secret.read("CHAIN_ID"),
  LIGHTHOUSE_API_KEY: secret.read("LIGHTHOUSE_API_KEY"),
  RPC_URL: secret.read("RPC_URL"),
  CONTRACT_ADDRESS: secret.read("CONTRACT_ADDRESS"),
  WRAPPED_SONIC_CONTRACT_ADDRESS: secret.read("WRAPPED_SONIC_CONTRACT_ADDRESS"),
  ALLORA_API_KEY: secret.read("ALLORA_API_KEY"),
  ALLORA_NETWORK: secret.read("ALLORA_NETWORK"),
  API_SCAN_VERIFIER_KEY: secret.read("API_SCAN_VERIFIER_KEY"),
};
