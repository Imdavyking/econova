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
const API_SCAN_VERIFIER_KEY = process.env.API_SCAN_VERIFIER_KEY

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

if (!API_SCAN_VERIFIER_KEY) {
    throw new Error("API_SCAN_VERIFIER_KEY is not set, used to verify contracts on explorer")
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
            accounts: [PRIVATE_KEY],
            chainId: +CHAIN_ID!,
            ignition: {
                explorerUrl: process.env.CHAIN_BLOCKEXPLORER_URL,
            },
        },
    },
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    etherscan: {
        apiKey: {
            testNetwork: API_SCAN_VERIFIER_KEY,
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
