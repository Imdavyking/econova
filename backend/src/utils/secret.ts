// dependencies
import fs from "fs";

export const secret: {
  read: (secretName: string) => string;
} = {
  read: (secretName) => {
    try {
      console.info(`Reading secret: ${secretName}`);
      return fs.readFileSync(`/run/secrets/${secretName}`, "utf8").trim();
    } catch (err: any) {
      const fromEnv = process.env[secretName];
      if (fromEnv) {
        console.info(`Reading secret from env: ${secretName}`);
        return fromEnv;
      }
      if (err.code !== "ENOENT") {
        console.error(
          `An error occurred while trying to read the secret: ${secretName}. Err: ${err}`
        );
      } else {
        console.debug(
          `Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`
        );
      }
      return "";
    }
  },
};
