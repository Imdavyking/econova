import fs from "fs"
import path from "path"

export function copyABI(contractName: string, destinationFolder: string) {
    const abiPath = path.join(
        __dirname,
        `../artifacts/contracts/${contractName}.sol/${contractName}.json`
    )
    const destPath = path.join(__dirname, `../../${destinationFolder}/${contractName}.json`)

    if (!fs.existsSync(abiPath)) {
        console.error(`❌ ABI file not found: ${abiPath}`)
        return
    }

    const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf8"))

    if (!contractJson.abi) {
        console.error(`❌ ABI key not found in JSON file: ${abiPath}`)
        return
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.writeFileSync(destPath, JSON.stringify(contractJson.abi, null, 2)) // Save only ABI

    console.log(`✅ ABI extracted and copied to ${destinationFolder}/${contractName}.json`)
}
