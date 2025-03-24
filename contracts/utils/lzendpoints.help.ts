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
    sendLibAddress?: string
    receiveLibAddress?: string
    dvnAddress?: string
    executorAddress?: string
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
    57054: {
        endpointV2: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
        endpointIdV2: EndpointId.SONIC_V2_TESTNET,
        name: "sonicBlaze",
        rpcUrl: "https://rpc.blaze.soniclabs.com",
        chainId: 57054,
    },
    56: {
        endpointV2: "0x1a44076050125825900e736c501f859c50fE728c",
        endpointIdV2: EndpointId.BSC_V2_MAINNET,
        name: "bscMainnet",
        rpcUrl: "https://rpc.ankr.com/bsc",
        chainId: 56,
    },
    146: {
        endpointV2: "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B",
        endpointIdV2: EndpointId.SONIC_V2_MAINNET,
        name: "sonicMainnet",
        rpcUrl: "https://rpc.soniclabs.com",
        chainId: 146,
        sendLibAddress: "0xC39161c743D0307EB9BCc9FEF03eeb9Dc4802de7",
        receiveLibAddress: "0xe1844c5D63a9543023008D332Bd3d2e6f1FE1043",
        dvnAddress: "0x282b3386571f7f794450d5789911a9804fa346b4",
        executorAddress: "0x4208D6E27538189bB48E603D6123A94b8Abe0A0b",
    },
    137: {
        endpointV2: "0x1a44076050125825900e736c501f859c50fE728c",
        endpointIdV2: EndpointId.POLYGON_V2_MAINNET,
        name: "polygon",
        rpcUrl: "https://rpc.ankr.com/polygon",
        chainId: 137,
        sendLibAddress: "0x6c26c61a97006888ea9E4FA36584c7df57Cd9dA3",
        receiveLibAddress: "0x1322871e4ab09Bc7f5717189434f97bBD9546e95",
        dvnAddress: "0x23de2fe932d9043291f870324b74f820e11dc81a",
        executorAddress: "0xCd3F213AD101472e1713C72B1697E727C803885b",
    },
}

export const crossChainLzInfo: LayerZeroChainInfo | null = process.env.CROSS_CHAIN_ID
    ? LZ_CHAINS[+process.env.CROSS_CHAIN_ID] ?? null
    : null
export const CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY =
    process.env.CROSS_CHAIN_ID_API_SCAN_VERIFIER_KEY
