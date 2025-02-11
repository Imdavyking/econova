import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { ethers } from "hardhat"

dotenv.config()

const ecoNovaNFTModule = buildModule("EcoNovaNFTModule", (m) => {
    const botPrivateKey = process.env.PRIVATE_KEY!
    const wallet = new ethers.Wallet(botPrivateKey)
    const ecoNovaNFTDeployer = m.contract("EcoNovaCourseNFT", [wallet.address])

    return { ecoNovaNFTDeployer }
})

export default ecoNovaNFTModule
