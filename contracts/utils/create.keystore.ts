import { ethers } from "hardhat"
import fs from "fs"

const createKeystore = ({ privatekey, password }: { privatekey: string; password: string }) => {
    const wallet = new ethers.Wallet(privatekey)
    const keystore = wallet.encryptSync(password)
    return keystore
}
