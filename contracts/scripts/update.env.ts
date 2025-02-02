import path from "path"
import fs from "fs"

export function updateEnv(contractAddress: string, folder: string, envKey: string) {
    const envPath = path.join(__dirname, `../../${folder}/.env`)

    if (!fs.existsSync(envPath)) {
        console.error(`❌ .env file not found in ${folder}!`)
        return
    }

    let envContent = fs.readFileSync(envPath, "utf8")

    // Replace or add the specified envKey
    const regex = new RegExp(`^${envKey}=.*`, "m")
    if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${envKey}=${contractAddress}`)
    } else {
        envContent += `\n${envKey}=${contractAddress}`
    }

    fs.writeFileSync(envPath, envContent)
    console.log(`✅ ${envKey} updated in ${folder}/.env successfully!`)
}
