import hre, { ethers } from "hardhat"
import dotenv from "dotenv"
import { verify } from "../utils/verify"
import { getMatchingChainId, LayerZeroChainInfo, LZ_CHAINS } from "../utils/lzendpoints.help"

dotenv.config()

export async function deployCrossChainOFT({
    remoteTokenAddr,
    remoteLzInfo,
}: {
    remoteTokenAddr: string
    remoteLzInfo: LayerZeroChainInfo
}): Promise<{
    crossChainLzInfo: LayerZeroChainInfo
    crossChainTokenAddress: string
}> {
    try {
        const PRIVATE_KEY = process.env.PRIVATE_KEY

        if (!PRIVATE_KEY) {
            throw new Error("❌ Missing PRIVATE_KEY or RPC_URL in .env file")
        }

        const provider = new ethers.JsonRpcProvider(remoteLzInfo.rpcUrl)
        const deployer = new ethers.Wallet(PRIVATE_KEY, provider)

        const chainId = Number((await provider.getNetwork()).chainId)
        if (!chainId) {
            throw new Error("❌ Chain ID is undefined. Ensure Hardhat is configured correctly.")
        }

        const lzEndpoint = LZ_CHAINS[chainId]
        if (!lzEndpoint) {
            throw new Error(`❌ LayerZero endpoint not found for chainId ${chainId}`)
        }

        console.log(`\n🚀 Deploying EcoNovaToken on Chain ID: ${chainId}`)
        console.log(`🔗 Using LZ Endpoint: ${lzEndpoint.endpointV2}\n`)

        const EcoNovaToken = await ethers.getContractFactory("EcoNovaToken", deployer)
        const ecoNovaToken = await EcoNovaToken.deploy(lzEndpoint.endpointV2, deployer.address)
        await ecoNovaToken.waitForDeployment()

        const deploymentAddress = await ecoNovaToken.getAddress()
        console.log(`✅ EcoNovaToken successfully deployed at: ${deploymentAddress}\n`)

        if (!remoteTokenAddr || !ethers.isAddress(remoteTokenAddr)) {
            console.log("⚠️ Missing or invalid remoteTokenAddr. Skipping peer setup.")
            throw new Error("❌ Missing or invalid remoteTokenAddr")
        }

        console.log(`🔄 Setting peer for cross-chain Endpoint: ${remoteLzInfo.endpointV2}`)
        await ecoNovaToken.setPeer(
            remoteLzInfo.endpointIdV2,
            ethers.zeroPadBytes(remoteTokenAddr, 32)
        )

        console.log("✅ Peer setup complete!\n")

        return {
            crossChainLzInfo: lzEndpoint,
            crossChainTokenAddress: deploymentAddress,
        }
    } catch (error) {
        console.error("❌ Error during deployment:", error)
        process.exit(1)
    }
}
