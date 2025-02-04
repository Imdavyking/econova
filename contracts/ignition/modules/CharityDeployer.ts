import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { charityCategories } from "../../utils/charity.categories"

dotenv.config()

const charityModule = buildModule("CharityDeployerModule", (m) => {
    const categories = Object.values(charityCategories)
    const charityDeployer = m.contract("Charity", [categories[0]])
    return { charityDeployer }
})

export default charityModule
