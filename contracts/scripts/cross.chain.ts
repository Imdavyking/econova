import hre, { ethers } from "hardhat"
import dotenv from "dotenv"
import { network } from "hardhat"
import { verify } from "../utils/verify"
import { LZ_ENDPOINTS } from "../utils/lzendpoints.help"
import { updateEnv } from "./update.env"

dotenv.config()

async function main() {
    const chainId = network.config.chainId
    if (!chainId) {
        throw new Error("Chain ID is undefined. Make sure Hardhat is configured correctly.")
    }

    const lzEndpoint = LZ_ENDPOINTS[chainId]
    if (!lzEndpoint) {
        throw new Error(`LayerZero endpoint not found for chainId ${chainId}`)
    }

    console.log(`Deploying EcoNovaToken on Chain ID: ${chainId} using LZ Endpoint: ${lzEndpoint}`)

    const EcoNovaToken = await ethers.getContractFactory("EcoNovaToken")
    const signers = await ethers.getSigners()
    const ecoNovaToken = await EcoNovaToken.deploy(lzEndpoint, signers[0])

    await ecoNovaToken.waitForDeployment()

    const deploymentAddress = await ecoNovaToken.getAddress()

    console.log(`EcoNovaToken deployed at: ${deploymentAddress}`)

    await verify(deploymentAddress, [lzEndpoint])

    console.log("✅ Deployment complete!")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
