// dependencies
import fs from "fs";
import logger from "../config/logger";

const dockerSecret: {
  read: (secretName: string) => string | false;
} = {
  read: (secretName) => {
    try {
      logger.info(`Reading secret: ${secretName}`);
      return fs.readFileSync(`/run/secrets/${secretName}`, "utf8");
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        logger.error(
          `An error occurred while trying to read the secret: ${secretName}. Err: ${err}`
        );
      } else {
        logger.debug(
          `Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`
        );
      }
      return false;
    }
  },
};

module.exports = dockerSecret;
