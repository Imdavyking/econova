import { ethers } from "hardhat"

export const LZ_ENDPOINTS: Record<number, string> = {
    31337: ethers.ZeroAddress,
    11155111: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    1: "0x1a44076050125825900e736c501f859c50fE728c",
    57054: "0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff",
    146: "0x6F475642a6e85809B1c36Fa62763669b1b48DD5B",
}

export const LZ_ENDPOINTS_IDS: Record<number, number> = {
    31337: 1,
    11155111: 40161,
    1: 30101,
    57054: 40349,
    146: 30332,
}

export const LZ_ENDPOINTS_NAME: Record<number, string> = {
    31337: "Hardhat (Mock)",
    11155111: "Sepolia",
    1: "Ethereum Mainnet",
    57054: "Sonic Blaze",
    146: "Sonic Mainnet",
}

export function getMatchingChainId(chainId: number): number | null {
    const testnetMapping: Record<number, number> = {
        57054: 11155111, // Sonic Blaze -> Sepolia
        11155111: 57054, // Sepolia -> Sonic Blaze
    }

    const mainnetMapping: Record<number, number> = {
        1: 146, // Ethereum Mainnet -> Sonic Mainnet
        146: 1, // Sonic Mainnet -> Ethereum Mainnet
    }

    return testnetMapping[chainId] ?? mainnetMapping[chainId] ?? null
}
