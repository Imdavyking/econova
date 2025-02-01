import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
const RPC_URL = process.env.RPC_URL
const CHAIN_ID = process.env.CHAIN_ID

if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set")
}

if (!RPC_URL) {
    throw new Error("RPC_URL is not set")
}

if (!CHAIN_ID) {
    throw new Error("CHAIN_ID is not set")
}

export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        testNetwork: {
            url: process.env.RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: +CHAIN_ID!,
        },
    },
    solidity: "0.8.28",
    etherscan: {
        apiKey: {
            creative: "abc",
        },
        customChains: [
            {
                network: "creative",
                chainId: 66665,
                urls: {
                    apiURL: "https://explorer.creatorchain.io/api",
                    browserURL: "https://explorer.creatorchain.io/",
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
}

export default config
