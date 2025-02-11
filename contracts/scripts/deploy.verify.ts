import hre, { ethers } from "hardhat"
import path from "path"

import EcoNovaDeployer from "../ignition/modules/EcoNovaDeployer"
import { verify } from "../utils/verify"
import dotenv from "dotenv"
import { network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
import { cleanDeployments } from "../utils/clean"
import { updateEnv } from "./update.env"
import { copyABI } from "./copy.abi"
dotenv.config()

async function main() {
    const chainId = network.config.chainId

    cleanDeployments(chainId!)
    const { ecoNovaDeployer } = await hre.ignition.deploy(EcoNovaDeployer)

    const ecoAddress = await ecoNovaDeployer.getAddress()
    const botPrivateKey = process.env.PRIVATE_KEY!
    const wallet = new ethers.Wallet(botPrivateKey)
    const chainName = process.env.CHAIN_NAME!
    const chainCurrencyName = process.env.CHAIN_CURRENCY_NAME!
    const chainSymbol = process.env.CHAIN_SYMBOL!
    console.log(`EcoNovaDeployer deployed to: ${ecoAddress}`)

    const contract = await ethers.getContractAt("EcoNovaManager", ecoAddress)

    const verifier = await contract.i_groth16VerifierP3()

    console.log(`Verifier deployed to: ${verifier}`)

    const charityLength = await contract.charityLength()

    const charities = []

    for (let i = 0; i < Number(charityLength); i++) {
        const charity = await contract.charityOrganizations(i)
        console.log(`Charity(${i}):deployed to: ${charity}`)
        charities.push(charity)
    }

    if (chainId === 31337) return

    let oracle: NamedArtifactContractDeploymentFuture<"MockOracleAggregator"> | string =
        process.env.ORACLE_ADDRESS!

    await verify(ecoAddress, [oracle, wallet.address, [...charities], verifier])

    const blockNumber = await ethers.provider.getBlockNumber()
    const rpcUrl = (network.config as any).url
    const blockExplorerUrl = network.config.ignition.explorerUrl!
    /** contract address */
    updateEnv(ecoAddress, "frontend", "VITE_CONTRACT_ADDRESS")
    updateEnv(ecoAddress, "indexer", "CONTRACT_ADDRESS")
    updateEnv(ecoAddress, "backend", "CONTRACT_ADDRESS")
    /** block number */
    updateEnv(blockNumber.toString(), "indexer", "BLOCK_NUMBER")
    /** chainid */
    updateEnv(chainId!.toString()!, "frontend", "VITE_CHAIN_ID")
    updateEnv(chainId!.toString()!, "backend", "CHAIN_ID")
    updateEnv(chainId!.toString()!, "indexer", "CHAIN_ID")
    /** rpc url */
    updateEnv(rpcUrl, "frontend", "VITE_RPC_URL")
    updateEnv(rpcUrl, "indexer", "RPC_URL")
    updateEnv(rpcUrl, "backend", "RPC_URL")
    /** block explorer url (3091) */
    updateEnv(blockExplorerUrl, "frontend", "VITE_CHAIN_BLOCKEXPLORER_URL")
    /** update chain name */
    updateEnv(chainName, "frontend", "VITE_CHAIN_NAME")
    /** update chain currency name */
    updateEnv(chainCurrencyName, "frontend", "VITE_CHAIN_CURRENCY_NAME")
    /** update chain currency name */
    updateEnv(chainSymbol, "frontend", "VITE_CHAIN_SYMBOL")

    copyABI("EcoNovaManager", "frontend/src/assets/json")
    copyABI("EcoNovaManager", "indexer/abis")
    copyABI("EcoNovaCourseNFT", "backend/src/abis")
}

main().catch(console.error)
