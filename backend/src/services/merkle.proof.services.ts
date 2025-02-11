import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { MerkleTreeModel } from "../models/merkle.tree";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { CHAIN_ID } from "../utils/constants";
dotenv.config();

export async function saveMerkleRoot(newValue: [string, number]) {
  const existingMerkleTree = await MerkleTreeModel.findOne();
  let allValues: [string, number][] = [newValue];
  let proof = null;

  if (existingMerkleTree) {
    const existingTree = StandardMerkleTree.load(existingMerkleTree.treeData);
    const existingValues = Array.from(existingTree.entries()).map(
      ([_, v]) => v
    );

    const uniqueValues = new Set(existingValues.map((v) => JSON.stringify(v)));
    uniqueValues.add(JSON.stringify(newValue));

    allValues = Array.from(uniqueValues).map((v) => JSON.parse(v));
  }

  const tree = StandardMerkleTree.of(allValues, ["address", "uint8"]);
  for (const [i, v] of tree.entries()) {
    if (v[0] === newValue[0] && v[1] === newValue[1]) {
      proof = tree.getProof(i);
      break;
    }
  }
  await MerkleTreeModel.deleteMany();
  const merkleTree = new MerkleTreeModel({
    root: tree.root,
    treeData: tree.dump(),
  });
  await merkleTree.save();

  return {
    root: tree.root,
    proof,
  };
}


export const signUserLevelWithRoot = async (
  senderAddress: string,
  level: number,
  root: string
) => {
  const botPrivateKey = process.env.BOT_PRIVATE_KEY!;
  const wallet = new ethers.Wallet(botPrivateKey);

  const timestamp = Math.floor(Date.now() / 1000);

  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint8", "bytes32", "uint256", "uint256"],
    [senderAddress, level, root, CHAIN_ID, timestamp]
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

  return { signature, timestamp };
};
