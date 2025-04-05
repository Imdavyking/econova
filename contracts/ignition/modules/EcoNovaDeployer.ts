import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { network } from "hardhat"
import { NamedArtifactContractDeploymentFuture } from "@nomicfoundation/ignition-core"
import { charityCategories } from "../../utils/charity.categories"
import { localHardhat } from "../../utils/localhardhat.chainid"
import { LZ_CHAINS } from "../../utils/lzendpoints.help"

dotenv.config()

const ecoNovaModule = buildModule("EcoNovaModule", (m) => {
    const chainId = network.config.chainId
    let oracle: NamedArtifactContractDeploymentFuture<"MockPythPriceFeed"> | string =
        process.env.ORACLE_ADDRESS!

    let lzInfo = LZ_CHAINS[+chainId!]

    let lzEndPoint: NamedArtifactContractDeploymentFuture<"EndpointV2Mock"> | string =
        lzInfo.endpointV2

    const wallet = m.getAccount(0)

    if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) {
        oracle = m.contract("MockPythPriceFeed", [])
        lzEndPoint = m.contract("EndpointV2Mock", [1])
    }

    const charityContracts = []

    for (const categoryKey of Object.keys(
        charityCategories
    ) as (keyof typeof charityCategories)[]) {
        const category = charityCategories[categoryKey]

        charityContracts.push(m.contract(`Charity`, [category, wallet], { id: categoryKey }))
    }

    const ecoNovaDeployer = m.contract("EcoNovaManager", [
        oracle,
        wallet,
        charityContracts,
        lzEndPoint,
    ])

    return { ecoNovaDeployer }
})

export default ecoNovaModule
