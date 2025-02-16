import { ethers } from "hardhat"
import { EndpointId } from "@layerzerolabs/lz-definitions"

export type LayerZeroChainInfo = {
    endpointV2: string
    endpointIdV2: number
    name: string
    rpcUrl: string | undefined
}

export const LZ_CHAINS: Record<number, LayerZeroChainInfo> = {
    31337: { endpointV2: ethers.ZeroAddress, endpointIdV2: 1, name: "Hardhat (Mock)", rpcUrl: "" },
    11155111: {
        endpointV2: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        endpointIdV2: EndpointId.SEPOLIA_V2_TESTNET,
        name: "Sepolia",
        rpcUrl: "https://rpc.testnet.sepolia.io",
    },
    1: {
        endpointV2: "0x1a44076050125825900e736c501f859c50fE728c",
        endpointIdV2: EndpointId.ETHEREUM_V2_MAINNET,
        name: "Ethereum Mainnet",
        rpcUrl: "https://rpc.testnet.sepolia.io",
    },
    57054: {
        endpointV2: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
        endpointIdV2: EndpointId.SONIC_V2_TESTNET,
        name: "Sonic Blaze",
        rpcUrl: "https://rpc.testnet.sepolia.io",
    },
    146: {
        endpointV2: "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B",
        endpointIdV2: EndpointId.SONIC_V2_MAINNET,
        name: "Sonic Mainnet",
        rpcUrl: "https://rpc.testnet.sepolia.io",
    },
}

// Define bidirectional cross-chain connections
export const LZ_CONNECTIONS: { from: number; to: number }[] = [
    { from: 11155111, to: 57054 }, // Sepolia → Sonic Blaze
    { from: 57054, to: 11155111 }, // Sonic Blaze → Sepolia
    { from: 1, to: 146 }, // Ethereum Mainnet → Sonic Mainnet
    { from: 146, to: 1 }, // Sonic Mainnet → Ethereum Mainnet
]

/**
 * Get the matching cross-chain ID.
 * @param chainId Source chain ID.
 * @returns The matching chain ID or null if no pair exists.
 */
export function getMatchingChainId(chainId: number): number | null {
    const match = LZ_CONNECTIONS.find((pair) => pair.from === chainId)
    return match ? match.to : null
}
