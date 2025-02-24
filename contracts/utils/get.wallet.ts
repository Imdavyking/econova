import { ethers } from "hardhat"
import fs from "fs"

export const getPrivateKeyFromKeyStore = ({
    keyStoreFile,
    keyStorePassword,
}: {
    keyStoreFile: string
    keyStorePassword: string
}) => {
    const keystore = fs.readFileSync(keyStoreFile, "utf8")
    const wallet = ethers.Wallet.fromEncryptedJsonSync(keystore, keyStorePassword)
    return wallet.privateKey
}
