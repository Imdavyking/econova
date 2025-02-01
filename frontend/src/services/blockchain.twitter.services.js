import ethers from "ethers";
import { getSigner } from "./blockchain.services";

export const signTweetId = async (tweetId) => {
  const messageHash = ethers.utils.solidityKeccak256(["uint256"], [tweetId]);

  const ethSignedMessageHash = ethers.utils.hashMessage(
    ethers.utils.arrayify(messageHash)
  );

  const wallet = await getSigner();

  const signature = await wallet.signMessage(
    ethers.utils.arrayify(messageHash)
  );

  const signerAddress = ethers.utils.recoverAddress(
    ethSignedMessageHash,
    signature
  );

  if (signerAddress !== wallet.address) {
    throw new Error("Invalid signature");
  }

  return signature;
};
