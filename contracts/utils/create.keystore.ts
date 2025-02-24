import { ethers } from "ethers"

export const createKeystore = ({
    privatekey,
    password,
}: {
    privatekey: string
    password: string
}) => {
    const wallet = new ethers.Wallet(privatekey)
    const keystore = wallet.encryptSync(password)
    return { keystore, password, address: wallet.address }
}
