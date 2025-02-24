import { ethers } from "ethers";
import dotenv from "dotenv";
import { CHAIN_ID } from "../utils/constants";
import { environment } from "../utils/config";

dotenv.config();

/**
 * Sign a message with the bot private key
 * @param senderAddress The address of the sender
 * @param pointToAdd The amount of points to add
 * @param tweetId The nonce
 * @returns The signature and the amount of points to add
 */
export const signTwitterPoints = async (
  senderAddress: string,
  pointToAdd: string | number,
  userTwitterId: string | number,
  tweetId: string | number
) => {
  const botPrivateKey = environment.PRIVATE_KEY!;

  const wallet = new ethers.Wallet(botPrivateKey);

  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256", "uint256", "uint256"],
    [senderAddress, pointToAdd, userTwitterId, tweetId, CHAIN_ID]
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

  return { signature, chainId: CHAIN_ID, pointToAdd };
};
