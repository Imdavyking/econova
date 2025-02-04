import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"
import { charityCategories } from "../../utils/charity.categories"

dotenv.config()

const charityModules: Array<ReturnType<typeof buildModule>> = []

for (const categoryKey of Object.keys(charityCategories) as (keyof typeof charityCategories)[]) {
    const category = charityCategories[categoryKey]

    const charityModule = buildModule(`CharityDeployerModule_${categoryKey}`, (m) => {
        const charityDeployer = m.contract("Charity", [category], { id: categoryKey })
        return { charityDeployer }
    })

    charityModules.push(charityModule)
}

export default charityModules
