import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const secret: {
  read: (secretName: string) => string;
  loadAll: () => Record<string, string>;
} = {
  read: (secretName) => {
    try {
      return fs.readFileSync(`/run/secrets/${secretName}`, "utf8").trim();
    } catch (err: any) {
      const fromEnv = process.env[secretName];
      if (fromEnv) {
        return fromEnv;
      }
      console.log(`❌ Missing secret: ${secretName}`);
      return "";
    }
  },

  loadAll: () => {
    const secrets = [
      "MONGO_URI",
      "TWITTER_CONSUMER_KEY",
      "TWITTER_CONSUMER_SECRET",
      "TWITTER_ACCESS_TOKEN",
      "TWITTER_ACCESS_TOKEN_SECRET",
      "TWITTER_USER_ID",
      "TWITTER_BEARER_TOKEN",
      "REDIS_HOST",
      "REDIS_PORT",
      "REDIS_PASSWORD",
      "NODE_ENV",
      "OPENAI_API_KEY",
      "JWT_SECRET",
      "PORT",
      "FRONTEND_URL",
      "CHAIN_ID",
      "RPC_URL",
      "CONTRACT_ADDRESS",
      "API_SCAN_VERIFIER_KEY",
      "COINGECKO_DEMO_API_KEY",
      "PINATA_JWT",
      "API_BROWSER_URL",
    ];

    const loadedSecrets: Record<string, string> = {};

    secrets.forEach((secretName) => {
      loadedSecrets[secretName] = secret.read(secretName);
    });

    console.info("✅ All secrets loaded into memory.");
    return loadedSecrets;
  },
};

// Utility to mask secret names in logs
const mask = (name: string) => name.replace(/[a-zA-Z0-9]/g, "*");
