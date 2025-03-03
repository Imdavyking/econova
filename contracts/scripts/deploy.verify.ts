import hre, { ethers } from "hardhat"

import EcoNovaDeployer from "../ignition/modules/EcoNovaDeployer"
import EcoNovaCourseNFTDeployer from "../ignition/modules/EcoNovaCourseNFTDeployer"
import { verify } from "../utils/verify"
import dotenv from "dotenv"
import { network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
import { cleanDeployments } from "../utils/clean"
import { updateEnv } from "./update.env"
import { copyABI } from "./copy.abi"
import { localHardhat } from "../utils/localhardhat.chainid"
import { deployCrossChainOFT } from "./econova.token.cross.chain"
import { crossChainLzInfo, LZ_CHAINS } from "../utils/lzendpoints.help"
import {
    MIN_DELAY,
    PROPOSAL_THRESHOLD,
    QUORUM_PERCENTAGE,
    VOTING_DELAY,
    VOTING_PERIOD,
} from "../utils/constants"
dotenv.config()

async function main() {
    const chainId = network.config.chainId!

    cleanDeployments(chainId!)
    const { ecoNovaDeployer } = await hre.ignition.deploy(EcoNovaDeployer)
    const { ecoNovaNFTDeployer } = await hre.ignition.deploy(EcoNovaCourseNFTDeployer)
    const [wallet] = await ethers.getSigners()
    const ecoAddress = await ecoNovaDeployer.getAddress()
    const ecoCourseNFTAddress = await ecoNovaNFTDeployer.getAddress()
    const chainName = process.env.CHAIN_NAME!
    const chainCurrencyName = process.env.CHAIN_CURRENCY_NAME!
    const chainSymbol = process.env.CHAIN_SYMBOL!
    const layerZeroChainInfo = LZ_CHAINS[+chainId]
    const [owner] = await ethers.getSigners()
    console.log(`EcoNovaManager deployed to: ${ecoAddress}`)
    console.log(`EcoNovaCourseNFT deployed to: ${ecoCourseNFTAddress}`)
    const GovernorFactory = await hre.ethers.getContractFactory("EcoNovaGovernor")

    const contract = await ethers.getContractAt("EcoNovaManager", ecoAddress)

    const verifier = await contract.i_groth16VerifierP3()
    await verify(verifier, [])

    const tokenAddress = await contract.i_ecoNovaToken()
    console.log(`EcoNovaToken deployed to: ${tokenAddress}`)
    await verify(tokenAddress, [layerZeroChainInfo.endpointV2, owner.address])

    console.log(`Groth16VerifierP3 deployed to: ${verifier}`)

    const charityLength = await contract.charityLength()

    const charities = []
    let governorTimeLock

    for (let i = 0; i < Number(charityLength); i++) {
        const charity = await contract.charityOrganizations(i)
        if (typeof governorTimeLock === "undefined") {
            const charityContract = await ethers.getContractAt("Charity", charity)
            governorTimeLock = await charityContract.governorTimeLock()
        }
        console.log(`Charity(${i}):deployed to: ${charity}`)
        await verify(charity, [i, governorTimeLock])
        charities.push(charity)
    }

    const ecoNovaGovernorDeployer = await GovernorFactory.deploy(
        tokenAddress,
        governorTimeLock!,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
        PROPOSAL_THRESHOLD
    )

    const ecoNovaGovernorAddress = await ecoNovaGovernorDeployer.getAddress()

    console.log(`EcoNovaGovernor deployed to: ${ecoNovaGovernorAddress}`)

    let oracle: NamedArtifactContractDeploymentFuture<"MockOracleAggregator"> | string =
        process.env.ORACLE_ADDRESS!

    await verify(ecoNovaGovernorAddress, [
        tokenAddress,
        governorTimeLock,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
    ])

    console.log(`TimeLock deployed to: ${governorTimeLock}`)

    await verify(
        governorTimeLock,
        [MIN_DELAY, [], [], wallet.address],
        "contracts/dao/TimeLock.sol:TimeLock"
    )

    await verify(ecoAddress, [
        oracle,
        wallet.address,
        [...charities],
        verifier,
        layerZeroChainInfo.endpointV2,
    ])
    await verify(ecoCourseNFTAddress, [wallet.address])

    const timeLockDeployer = await ethers.getContractAt("TimeLock", governorTimeLock!)

    const proposerRole = await timeLockDeployer.PROPOSER_ROLE()
    const executorRole = await timeLockDeployer.EXECUTOR_ROLE()
    const adminRole = await timeLockDeployer.DEFAULT_ADMIN_ROLE()

    const proposerTx = await timeLockDeployer.grantRole(proposerRole, ecoNovaGovernorDeployer)
    await proposerTx.wait(1)
    const executorTx = await timeLockDeployer.grantRole(executorRole, ethers.ZeroAddress)
    await executorTx.wait(1)
    const revokeTx = await timeLockDeployer.revokeRole(adminRole, owner)
    await revokeTx.wait(1)

    if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) return

    const blockNumber = await ethers.provider.getBlockNumber()
    const rpcUrl = (network.config as any).url
    const blockExplorerUrl = network.config.ignition.explorerUrl!
    const WRAPPED_SONIC_CONTRACT_ADDRESS = "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38"
    /** contract address */
    updateEnv(ecoAddress, "frontend", "VITE_CONTRACT_ADDRESS")
    updateEnv(ecoCourseNFTAddress, "frontend", "VITE_NFT_COURSE_CONTRACT_ADDRESS")
    updateEnv(ecoNovaGovernorAddress, "frontend", "VITE_ECONOVA_GOVERNOR_CONTRACT_ADDRESS")
    updateEnv(ecoAddress, "indexer", "CONTRACT_ADDRESS")
    updateEnv(ecoNovaGovernorAddress, "indexer", "GOVERNOR_CONTRACT_ADDRESS")
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
    /** wrapped sonic */
    updateEnv(WRAPPED_SONIC_CONTRACT_ADDRESS, "backend", "WRAPPED_SONIC_CONTRACT_ADDRESS")
    updateEnv(WRAPPED_SONIC_CONTRACT_ADDRESS, "frontend", "VITE_WRAPPED_SONIC_CONTRACT_ADDRESS")

    copyABI("EcoNovaManager", "frontend/src/assets/json", null)
    copyABI("EcoNovaGovernor", "frontend/src/assets/json", "governor")
    copyABI("Charity", "frontend/src/assets/json", "charity")
    copyABI("EcoNovaCourseNFT", "frontend/src/assets/json", "course-nft")
    copyABI("EcoNovaToken", "frontend/src/assets/json", "erc20")
    copyABI("EcoNovaManager", "indexer/abis", null)
    copyABI("EcoNovaGovernor", "indexer/abis", "governor")

    if (localHardhat.includes(chainId)) return

    if (process.env.DEPLOY_CROSS_CHAIN_OFT === "true" && process.env.CROSS_CHAIN_ID) {
        if (!crossChainLzInfo) {
            console.error("Cross chain info not found")
            return
        }

        if (crossChainLzInfo.chainId === +chainId) {
            console.log("Cross chain deployment is not needed for the same chain")
            return
        }

        const EndpointV2 = await ethers.getContractAt("IEndpointV2", layerZeroChainInfo.endpointV2)

        const isSupported = await EndpointV2.isSupportedEid(crossChainLzInfo.endpointIdV2)

        if (!isSupported) {
            console.error("Cross chain endpoint is not supported")
            return
        }

        const currentNetwork = hre.network.name as string

        await hre.changeNetwork(crossChainLzInfo.name)

        const { crossChainTokenAddress } = await deployCrossChainOFT({
            remoteTokenAddr: tokenAddress,
            remoteLzInfo: layerZeroChainInfo,
            crossChainLzInfo,
        })

        console.log(`🔄 Setting peer for cross-chain Endpoint: ${crossChainLzInfo.endpointV2}`)

        await hre.changeNetwork(currentNetwork)

        const ecoNovaToken = await ethers.getContractAt("EcoNovaToken", tokenAddress)
        await ecoNovaToken.setPeer(
            crossChainLzInfo.endpointIdV2,
            ethers.zeroPadValue(crossChainTokenAddress, 32)
        )
        console.log("✅ Peer setup complete!\n")

        await hre.changeNetwork(crossChainLzInfo.name)

        await verify(crossChainTokenAddress, [crossChainLzInfo.endpointV2, owner.address])

        updateEnv(crossChainTokenAddress, "frontend", "VITE_CROSS_CHAIN_TOKEN_ADDRESS")
        updateEnv(crossChainLzInfo.rpcUrl!, "frontend", "VITE_CROSS_CHAIN_RPC_URL")
        updateEnv(crossChainLzInfo.chainId.toString()!, "frontend", "VITE_CROSS_CHAIN_ID")
        updateEnv(
            crossChainLzInfo.endpointIdV2.toString(),
            "frontend",
            "VITE_CROSS_CHAIN_ENDPOINT_V2_ID"
        )
        updateEnv(crossChainLzInfo.endpointV2, "frontend", "VITE_CROSS_CHAIN_ENDPOINT_V2_ADDRESS")
    }
}

main().catch(console.error)
