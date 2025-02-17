import { HardhatUserConfig, extendEnvironment } from "hardhat/config"
import { createProvider } from "hardhat/internal/core/providers/construction"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider"
import dotenv from "dotenv"
import {
    CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY,
    crossChainLzInfo,
    LZ_CHAINS,
} from "./utils/lzendpoints.help"
import { EthereumProvider } from "hardhat/types"
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

declare module "hardhat/types/runtime" {
    export interface HardhatRuntimeEnvironment {
        changeNetwork: Function
    }
}

extendEnvironment(async (hre) => {
    hre.changeNetwork = async function changeNetwork(newNetwork: string) {
        console.log(newNetwork)
        console.log(hre.config.networks)
        hre.network.name = newNetwork
        hre.network.config = hre.config.networks[newNetwork]

        const ethProvider = new hre.ethers.JsonRpcProvider(
            (hre.network.config as any).url
        ) as unknown as EthereumProvider

        hre.ethers.provider = new HardhatEthersProvider(ethProvider, newNetwork)
        hre.network.provider = await createProvider(hre.config, newNetwork)
    }
})

export const crossChainConfig = crossChainLzInfo
    ? {
          [crossChainLzInfo.name]: {
              url: crossChainLzInfo.rpcUrl,
              chainId: Number(CHAIN_ID), // Ensure CHAIN_ID is a number
              accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
          },
      }
    : {}

export const crossChainVerifierKeys = crossChainLzInfo
    ? { [crossChainLzInfo.name]: CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY ?? "" }
    : {}

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
        ...crossChainConfig,
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
            ...crossChainVerifierKeys,
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
