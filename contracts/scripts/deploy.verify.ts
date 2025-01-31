import hre from "hardhat"
import path from "path"

import EcoNovaDeployer from "../ignition/modules/EcoNovaDeployer"
import { verify } from "../utils/verify"
import dotenv from "dotenv"
import { network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
import { cleanDeployments } from "../utils/clean"
dotenv.config()

async function main() {
    const chainId = network.config.chainId
    cleanDeployments(chainId!)
    const { ecoNovaDeployer } = await hre.ignition.deploy(EcoNovaDeployer)
    const ecoAddress = await ecoNovaDeployer.getAddress()

    console.log(`EcoNovaDeployer deployed to: ${ecoAddress}`)

    if (chainId === 31337) return

    let oracle: NamedArtifactContractDeploymentFuture<"MockOracleAggregator"> | string =
        process.env.OROCHI_ORACLE_ADDRESS!

    await verify(ecoAddress, [oracle])

    console.log(`EcoNovaDeployer deployed to: ${ecoAddress}`)
}

main().catch(console.error)
