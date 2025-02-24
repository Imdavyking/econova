import { ethers, Provider } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import { environment } from "./config";
import { secret } from "./secret";

dotenv.config();

export const initKeystore = (provider: Provider | null) => {
  try {
    const privateKey = secret.read("PRIVATE_KEY");
    if (privateKey.trim() !== "") {
      console.warn(
        "⚠️ Using PRIVATE_KEY from .env file. Do not use in production."
      );
      return new ethers.Wallet(privateKey, provider);
    }

    const keyStoreFile = secret.read("KEYSTORE_FILE");
    const keyStorePassword = secret.read("KEYSTORE_PASSWORD");

    if (!fs.existsSync(keyStoreFile)) {
      console.error(`❌ Keystore file not found: ${keyStoreFile}`);
      throw new Error(`Keystore file not found: ${keyStoreFile}`);
    }

    const keystore = fs.readFileSync(keyStoreFile, "utf8");
    const keystoreDetails = ethers.Wallet.fromEncryptedJsonSync(
      keystore,
      keyStorePassword
    );
    const wallet = new ethers.Wallet(keystoreDetails.privateKey, provider);
    console.log("✅ Wallet successfully decrypted from keystore.");
    return wallet;
  } catch (error: any) {
    console.error(`❌ Error decrypting keystore: ${error.message}`);
    throw error;
  }
};
