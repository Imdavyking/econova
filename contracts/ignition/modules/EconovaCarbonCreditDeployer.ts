import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import dotenv from "dotenv"

dotenv.config()

const ecoNovaCarbonCreditModule = buildModule("EcoNovaCarbonCreditModule", (m) => {
    const carbonCredit = m.contract("EcoNovaCarbonCreditsV1", [])
    const data = m.encodeFunctionCall(carbonCredit, "initialize")
    const carbonCreditProxy = m.contract("ERC1967Proxy", [carbonCredit, data])
    return { carbonCreditProxy }
})

export default ecoNovaCarbonCreditModule
