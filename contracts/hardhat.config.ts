import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
const RPC_URL = process.env.RPC_URL
const CHAIN_ID = process.env.CHAIN_ID
const API_URL = process.env.API_URL
const BROWSER_URL = process.env.BROWSER_URL

if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set")
}

if (!RPC_URL) {
    throw new Error("RPC_URL is not set")
}

if (!CHAIN_ID) {
    throw new Error("CHAIN_ID is not set")
}

if (!API_URL) {
    throw new Error("API_URL is not set")
}

if (!BROWSER_URL) {
    throw new Error("BROWSER_URL is not set")
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
            url: process.env.RPC_URL || "https://rpc.creatorchain.io",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: +CHAIN_ID!,
        },
    },
    solidity: "0.8.28",
    etherscan: {
        apiKey: {
            testNetwork: "abc",
        },
        customChains: [
            {
                network: "testNetwork",
                chainId: +CHAIN_ID!,
                urls: {
                    apiURL: API_URL,
                    browserURL: BROWSER_URL,
                },
            },
        ],
    },
    sourcify: {
        enabled: false,
    },
}

export default config
