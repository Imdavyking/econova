import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const signTwitterPoints = async (
  senderAddress: string,
  pointToAdd: string | number,
  nonce: string | number
) => {
  const botPrivateKey = process.env.BOT_PRIVATE_KEY!;

  const wallet = new ethers.Wallet(botPrivateKey);

  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [senderAddress, pointToAdd, nonce]
  );

  const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));

  const signature = await wallet.signMessage(ethers.getBytes(messageHash));

  const addressThatSign = ethers.recoverAddress(
    ethSignedMessageHash,
    signature
  );

  if (addressThatSign !== wallet.address) {
    throw new Error("Invalid signature");
  }

  return signature;
};
