import { run, network } from "hardhat"
import { localHardhat } from "../scripts/deploy.verify"

export const verify = async (contractAddress: any, args: any) => {
    try {
        const chainId = network.config.chainId

        if (typeof chainId !== "undefined" && localHardhat.includes(chainId)) return
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e.message)
        }
    }
}

module.exports = { verify }
