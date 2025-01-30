import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomicfoundation/hardhat-verify"
import dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY

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
        creative: {
            url: process.env.CREATIVE_RPC_URL || "https://rpc.creatorchain.io",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 66665,
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
