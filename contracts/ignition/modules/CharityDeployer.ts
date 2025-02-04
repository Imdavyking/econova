import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { charityCategories } from "../../utils/charity.categories"

dotenv.config()
const charityModules: Array<ReturnType<typeof buildModule>> = []

for (const category of Object.keys(charityCategories) as Array<keyof typeof charityCategories>) {
    const category = charityCategories[category]
    charityModules.push(
        buildModule("CharityDeployerModule", (m) => {
            const charityDeployer = m.contract("Charity", [category], { id: category })
            return { charityDeployer }
        })
    )
}

export default charityModules
