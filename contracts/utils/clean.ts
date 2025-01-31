import path from "path"
import fs from "fs"

// Remove ignition/deployments if it exists
export const cleanDeployments = () => {
    const ignitionDeployments = path.join(process.cwd(), "ignition", "deployments")
    if (fs.existsSync(ignitionDeployments)) {
        console.log(`🗑️ Deleting folder: ${ignitionDeployments}`)
        fs.rmSync(ignitionDeployments, { recursive: true, force: true })
    }
}
