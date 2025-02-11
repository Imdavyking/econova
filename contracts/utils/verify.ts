import { run } from "hardhat"

export const verify = async (contractAddress: any, args: any) => {
    try {
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
