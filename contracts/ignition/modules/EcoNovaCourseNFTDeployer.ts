import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { ethers } from "hardhat"
import { initKeystore } from "../../utils/init.keystore"

dotenv.config()

const ecoNovaNFTModule = buildModule("EcoNovaNFTModule", (m) => {
    const wallet = initKeystore(null)
    const ecoNovaNFTDeployer = m.contract("EcoNovaCourseNFT", [wallet.address])

    return { ecoNovaNFTDeployer }
})

export default ecoNovaNFTModule
