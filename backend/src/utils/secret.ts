// dependencies
import fs from "fs";
import logger from "../config/logger";

export const secret: {
  read: (secretName: string) => string;
} = {
  read: (secretName) => {
    try {
      logger.info(`Reading secret: ${secretName}`);
      return fs.readFileSync(`/run/secrets/${secretName}`, "utf8");
    } catch (err: any) {
      const fromEnv = process.env[secretName];
      if (fromEnv) {
        logger.info(`Reading secret from env: ${secretName}`);
        return fromEnv;
      }
      if (err.code !== "ENOENT") {
        logger.error(
          `An error occurred while trying to read the secret: ${secretName}. Err: ${err}`
        );
      } else {
        logger.debug(
          `Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`
        );
      }
      return "";
    }
  },
};
