import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"

dotenv.config()

const ecoNovaNFTModule = buildModule("EcoNovaNFTModule", (m) => {
    const wallet = m.getAccount(0)
    const ecoNovaNFTDeployer = m.contract("EcoNovaCourseNFT", [wallet])
    return { ecoNovaNFTDeployer }
})

export default ecoNovaNFTModule
