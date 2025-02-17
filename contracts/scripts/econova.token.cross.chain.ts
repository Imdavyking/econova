import { ethers } from "hardhat"
import dotenv from "dotenv"
import { LayerZeroChainInfo, LZ_CHAINS } from "../utils/lzendpoints.help"

dotenv.config()

export async function deployCrossChainOFT({
    remoteTokenAddr,
    remoteLzInfo,
    crossChainLzInfo,
}: {
    remoteTokenAddr: string
    remoteLzInfo: LayerZeroChainInfo
    crossChainLzInfo: LayerZeroChainInfo
}): Promise<{
    crossChainTokenAddress: string
}> {
    try {
        const PRIVATE_KEY = process.env.PRIVATE_KEY
        const CROSS_CHAIN_RPC_URL = crossChainLzInfo.rpcUrl

        if (!PRIVATE_KEY || !CROSS_CHAIN_RPC_URL) {
            throw new Error("❌ Missing PRIVATE_KEY or CROSS_CHAIN_RPC_URL in .env file")
        }

        const provider = new ethers.JsonRpcProvider(CROSS_CHAIN_RPC_URL)
        const deployer = new ethers.Wallet(PRIVATE_KEY, provider)
        const networkInfo = await provider.getNetwork()

        const chainId = Number(networkInfo.chainId)
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
        const EndpointV2 = await ethers.getContractAt(
            "IEndpointV2",
            lzEndpoint.endpointV2,
            deployer
        )
        const ecoNovaToken = await EcoNovaToken.deploy(lzEndpoint.endpointV2, deployer.address)
        await ecoNovaToken.waitForDeployment()

        const crossTokenAddress = await ecoNovaToken.getAddress()
        console.log(`✅ EcoNovaToken successfully deployed at: ${crossTokenAddress}\n`)

        if (!remoteTokenAddr || !ethers.isAddress(remoteTokenAddr)) {
            console.log("⚠️ Missing or invalid remoteTokenAddr. Skipping peer setup.")
            throw new Error("❌ Missing or invalid remoteTokenAddr")
        }

        console.log(`🔄 Setting remote token address: ${remoteTokenAddr}`)
        // TODO: fix this
        // await EndpointV2.setDestLzEndpoint(remoteTokenAddr, remoteLzInfo.endpointV2)

        console.log(`🔄 Setting peer for cross-chain Endpoint: ${remoteLzInfo.endpointV2}`)
        await ecoNovaToken.setPeer(
            remoteLzInfo.endpointIdV2,
            ethers.zeroPadBytes(remoteTokenAddr, 32)
        )

        console.log("✅ Peer setup complete!\n")

        return {
            crossChainTokenAddress: crossTokenAddress,
        }
    } catch (error) {
        console.error("❌ Error during deployment:", error)
        process.exit(1)
    }
}
