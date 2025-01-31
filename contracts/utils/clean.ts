import path from "path"
import fs from "fs"

export const cleanDeployments = (chainId: number | string) => {
    const ignitionDeployments = path.join(
        process.cwd(),
        "ignition",
        "deployments",
        `chain-${chainId}`
    )
    if (fs.existsSync(ignitionDeployments)) {
        console.log(`🗑️ Deleting folder: ${ignitionDeployments}`)
        fs.rmSync(ignitionDeployments, { recursive: true, force: true })
    }
}
