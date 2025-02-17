import { ethers } from "ethers"
import { EndpointId } from "@layerzerolabs/lz-definitions"
import dotenv from "dotenv"
dotenv.config()

export type LayerZeroChainInfo = {
    endpointV2: string
    endpointIdV2: number
    name: string
    rpcUrl: string | undefined
    chainId: number
}

export const LZ_CHAINS: Record<number, LayerZeroChainInfo> = {
    31337: {
        endpointV2: ethers.ZeroAddress,
        endpointIdV2: 1,
        name: "Hardhat (Mock)",
        rpcUrl: "",
        chainId: 31337,
    },
    97: {
        endpointV2: "0x6EDCE65403992e310A62460808c4b910D972f10f",
        endpointIdV2: EndpointId.BSC_V2_TESTNET,
        name: "bscTestnet",
        rpcUrl: "https://data-seed-prebsc-2-s1.bnbchain.org:8545",
        chainId: 97,
    },
    56: {
        endpointV2: "0x1a44076050125825900e736c501f859c50fE728c",
        endpointIdV2: EndpointId.BSC_V2_MAINNET,
        name: "bscMainnet",
        rpcUrl: "https://rpc.ankr.com/bsc",
        chainId: 56,
    },
    57054: {
        endpointV2: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
        endpointIdV2: EndpointId.SONIC_V2_TESTNET,
        name: "sonicBlaze",
        rpcUrl: "https://rpc.blaze.soniclabs.com",
        chainId: 57054,
    },
    146: {
        endpointV2: "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B",
        endpointIdV2: EndpointId.SONIC_V2_MAINNET,
        name: "sonicMainnet",
        rpcUrl: "https://rpc.soniclabs.com",
        chainId: 146,
    },
}

export const crossChainLzInfo: LayerZeroChainInfo | null = process.env.CROSS_CHAIN_ID
    ? LZ_CHAINS[+process.env.CROSS_CHAIN_ID] ?? null
    : null
export const CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY =
    process.env.CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY
