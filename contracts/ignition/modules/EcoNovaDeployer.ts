import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { ethers, network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
import { charityCategories } from "../../utils/charity.categories"

dotenv.config()

const ecoNovaModule = buildModule("EcoNovaModule", (m) => {
    const chainId = network.config.chainId
    let oracle: NamedArtifactContractDeploymentFuture<"MockPythPriceFeed"> | string =
        process.env.ORACLE_ADDRESS!

    const botPrivateKey = process.env.PRIVATE_KEY!
    const wallet = new ethers.Wallet(botPrivateKey)

    if (chainId === 31337) {
        oracle = m.contract("MockPythPriceFeed", [])
    }

    const charityContracts = []

    for (const categoryKey of Object.keys(
        charityCategories
    ) as (keyof typeof charityCategories)[]) {
        const category = charityCategories[categoryKey]

        charityContracts.push(m.contract(`Charity`, [category], { id: categoryKey }))
    }
    const ecoNovaDeployer = m.contract("EcoNovaManager", [
        oracle,
        wallet.address,
        charityContracts,
    ])

    return { ecoNovaDeployer }
})

export default ecoNovaModule
