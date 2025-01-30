// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
dotenv.config()
const ecoNovaModule = buildModule("EcoNovaModule", (m) => {
    const chainId = network.config.chainId
    let oracle: NamedArtifactContractDeploymentFuture<"MockOracleAggregator"> | string =
        process.env.OROCHI_ORACLE_ADDRESS!
    if (chainId === 31337) {
        oracle = m.contract("MockOracleAggregator", [])
    }

    const ecoNovaDeployer = m.contract("EcoNovaManager", [oracle])

    return { ecoNovaDeployer }
})

export default ecoNovaModule
