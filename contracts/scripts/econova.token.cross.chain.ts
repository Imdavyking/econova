import hre, { ethers } from "hardhat"
import dotenv from "dotenv"
import { network } from "hardhat"
import { verify } from "../utils/verify"
import { getMatchingChainId, LZ_ENDPOINTS, LZ_ENDPOINTS_IDS } from "../utils/lzendpoints.help"

dotenv.config()

async function main() {
    try {
        // deploy script to connect ethereum and sonic econova token
        const chainId = network.config.chainId
        if (!chainId) {
            throw new Error("Chain ID is undefined. Ensure Hardhat is configured correctly.")
        }

        const lzEndpoint = LZ_ENDPOINTS[chainId]
        if (!lzEndpoint) {
            throw new Error(`LayerZero endpoint not found for chainId ${chainId}`)
        }

        console.log(`\n🚀 Deploying EcoNovaToken on Chain ID: ${chainId}`)
        console.log(`🔗 Using LZ Endpoint: ${lzEndpoint}\n`)

        const EcoNovaToken = await ethers.getContractFactory("EcoNovaToken")
        const endpointV2 = await ethers.getContractAt("EndpointV2Mock", lzEndpoint)
        const [deployer] = await ethers.getSigners()

        console.log(`👤 Deploying contract using account: ${deployer.address}`)
        const ecoNovaToken = await EcoNovaToken.deploy(lzEndpoint, deployer.address)
        await ecoNovaToken.waitForDeployment()

        const deploymentAddress = await ecoNovaToken.getAddress()
        console.log(`✅ EcoNovaToken successfully deployed at: ${deploymentAddress}\n`)

        console.log("🔍 Verifying contract...")
        await verify(deploymentAddress, [lzEndpoint])
        console.log("✅ Deployment and verification complete!\n")

        const crossChainId = getMatchingChainId(chainId)
        const crossChainEndpoint = LZ_ENDPOINTS[crossChainId!]
        if (!crossChainId) {
            console.log("Matching cross-chain ID not found.")
            return
        }

        const endPointId = LZ_ENDPOINTS_IDS[crossChainId]
        if (!endPointId) {
            console.log("Endpoint ID not found for cross-chain setup.")
            return
        }

        const remoteTokenAddr = process.argv[2]
        if (!remoteTokenAddr || !ethers.isAddress(remoteTokenAddr)) {
            console.log("⚠️ Missing or invalid remoteTokenAddr. Skipping peer setup.")
            return
        }

        await endpointV2.setDestLzEndpoint(remoteTokenAddr, crossChainEndpoint)
        console.log(`🔄 Setting peer for Endpoint ID: ${endPointId} on another chain.`)
        await ecoNovaToken.setPeer(endPointId, ethers.zeroPadBytes(remoteTokenAddr, 32))
    } catch (error) {
        console.error("❌ Error during deployment:", error)
        process.exit(1)
    }
}

main()
