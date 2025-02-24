import { ethers } from "hardhat"
import fs from "fs"
import dotenv from "dotenv"
import { Provider } from "ethers"

dotenv.config()

export const initKeystore = (provider: Provider | null) => {
    try {
        if (process.env.PRIVATE_KEY) {
            console.warn("⚠️ Using PRIVATE_KEY from .env file. Do not use in production.")
            return new ethers.Wallet(process.env.PRIVATE_KEY, provider)
        }

        const keyStoreFile = process.env.KEYSTORE_FILE ?? ""
        const keyStorePassword = process.env.KEYSTORE_PASSWORD ?? ""

        if (!fs.existsSync(keyStoreFile)) {
            console.error(`❌ Keystore file not found: ${keyStoreFile}`)
            return null
        }

        const keystore = fs.readFileSync(keyStoreFile, "utf8")
        const keystoreDetails = ethers.Wallet.fromEncryptedJsonSync(keystore, keyStorePassword)
        const wallet = new ethers.Wallet(keystoreDetails.privateKey, provider)
        console.log("✅ Wallet successfully decrypted from keystore.")
        return wallet
    } catch (error: any) {
        console.error("❌ Failed to initialize wallet:", error.message)
        return null
    }
}
