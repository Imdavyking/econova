// dependencies
import fs from "fs";

export const secret: {
  read: (secretName: string) => string;
} = {
  read: (secretName) => {
    try {
      console.info("Attempting to read a secret");
      return fs.readFileSync(`/run/secrets/${secretName}`, "utf8").trim();
    } catch (err: any) {
      const fromEnv = process.env[secretName];
      if (fromEnv) {
        console.warn(
          `⚠️ Warning: Using environment variable for secret ${secretName.replace(
            /[a-zA-Z0-9]/g,
            "*"
          )}.`
        );
        return fromEnv;
      }
      if (err.code !== "ENOENT") {
        console.error(
          `An error occurred while trying to read the secret: ${secretName.replace(
            /[a-zA-Z0-9]/g,
            "*"
          )}. Err: ${err}`
        );
      } else {
        console.debug(
          `Could not find the secret, probably not running in swarm mode: ${secretName.replace(
            /[a-zA-Z0-9]/g,
            "*"
          )}. Err: ${err}`
        );
      }
      return "";
    }
  },
};
