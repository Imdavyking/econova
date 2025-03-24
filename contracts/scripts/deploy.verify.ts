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
import { setLayerZeroLibs } from "./layerzero.dvn"
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
    console.log(`EcoNovaManager deployed to: ${ecoAddress}`)
    console.log(`EcoNovaCourseNFT deployed to: ${ecoCourseNFTAddress}`)
    const GovernorFactory = await hre.ethers.getContractFactory("EcoNovaGovernor")

    const TimeLockFactory = await hre.ethers.getContractFactory("TimeLock")

    const contract = await ethers.getContractAt("EcoNovaManager", ecoAddress)

    const verifier = await contract.i_groth16VerifierP3()
    await verify(verifier, [])

    const tokenAddress = await contract.i_ecoNovaToken()
    console.log(`EcoNovaToken deployed to: ${tokenAddress}`)
    await verify(tokenAddress, [layerZeroChainInfo.endpointV2, wallet.address])

    console.log(`Groth16VerifierP3 deployed to: ${verifier}`)

    const charityLength = await contract.charityLength()

    const charities = []
    const governorTimeLock = await TimeLockFactory.deploy(MIN_DELAY, [], [], wallet)

    await governorTimeLock.waitForDeployment()

    const governorTimeLockAddress = await governorTimeLock.getAddress()

    for (let i = 0; i < Number(charityLength); i++) {
        const charity = await contract.charityOrganizations(i)
        const charityContract = await ethers.getContractAt("Charity", charity)
        const ownerTx = await charityContract.transferOwnership(governorTimeLockAddress)
        await ownerTx.wait(1)
        console.log(`Charity(${i}):deployed to: ${charity}`)
        await verify(charity, [i, wallet.address])
        charities.push(charity)
    }

    const ecoNovaGovernorDeployer = await GovernorFactory.deploy(
        tokenAddress,
        governorTimeLockAddress,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
        PROPOSAL_THRESHOLD
    )

    await ecoNovaGovernorDeployer.waitForDeployment()

    const ecoNovaGovernorAddress = await ecoNovaGovernorDeployer.getAddress()

    console.log(`EcoNovaGovernor deployed to: ${ecoNovaGovernorAddress}`)

    let oracle: NamedArtifactContractDeploymentFuture<"MockOracleAggregator"> | string =
        process.env.ORACLE_ADDRESS!

    await verify(ecoNovaGovernorAddress, [
        tokenAddress,
        governorTimeLockAddress,
        QUORUM_PERCENTAGE,
        VOTING_PERIOD,
        VOTING_DELAY,
        PROPOSAL_THRESHOLD,
    ])

    console.log(`TimeLock deployed to: ${governorTimeLockAddress}`)

    await verify(
        governorTimeLockAddress,
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

    const proposerRole = await governorTimeLock.PROPOSER_ROLE()
    const executorRole = await governorTimeLock.EXECUTOR_ROLE()
    const adminRole = await governorTimeLock.DEFAULT_ADMIN_ROLE()

    const proposerTx = await governorTimeLock.grantRole(proposerRole, ecoNovaGovernorDeployer)
    await proposerTx.wait(1)
    const executorTx = await governorTimeLock.grantRole(executorRole, ethers.ZeroAddress)
    await executorTx.wait(1)
    const revokeTx = await governorTimeLock.revokeRole(adminRole, wallet)
    await revokeTx.wait(1)

    if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) return

    const blockNumber = await ethers.provider.getBlockNumber()
    const rpcUrl = (network.config as any).url
    const blockExplorerUrl = network.config.ignition.explorerUrl!
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

    copyABI("EcoNovaManager", "frontend/src/assets/json", null)
    copyABI("EcoNovaGovernor", "frontend/src/assets/json", "governor")
    copyABI("ICharityDao", "frontend/src/assets/json", "charity", true)
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

        await verify(crossChainTokenAddress, [crossChainLzInfo.endpointV2, wallet.address])

        updateEnv(crossChainLzInfo.chainId.toString()!, "frontend", "VITE_CROSS_CHAIN_ID")

        await setLayerZeroLibs(
            {
                layerzeroInfo: layerZeroChainInfo,
                oappAddress: tokenAddress,
            },
            {
                layerzeroInfo: crossChainLzInfo,
                oappAddress: crossChainTokenAddress,
            }
        )
    }
}

main().catch(console.error)
