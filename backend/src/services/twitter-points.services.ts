import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const signTwitterPoints = async (
  senderAddress: string,
  pointToAdd: string | number,
  nonce: string | number
) => {
  const botPrivateKey = process.env.TWITTER_BOT_ETH_PRIVATE_KEY!;

  const wallet = new ethers.Wallet(botPrivateKey);
  const messageHash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256"],
    [senderAddress, pointToAdd, nonce]
  );
  const ethSignedMessageHash = ethers.utils.hashMessage(
    ethers.utils.arrayify(messageHash)
  );
  return await wallet.signMessage(ethers.utils.arrayify(ethSignedMessageHash));
};
