import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { MerkleTreeModel } from "../models/merkle.tree";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { CHAIN_ID } from "../utils/constants";
dotenv.config();

export async function saveMerkleRoot(newValue: [string, number]) {
  const existingMerkleTree = await MerkleTreeModel.findOne();
  let allValues: [string, number][] = [newValue];

  if (existingMerkleTree) {
    const existingTree = StandardMerkleTree.load(existingMerkleTree.treeData);
    const existingValues = Array.from(existingTree.entries()).map(
      ([_, v]) => v
    );

    const uniqueValues = new Set(existingValues.map((v) => JSON.stringify(v)));
    uniqueValues.add(JSON.stringify(newValue));

    allValues = Array.from(uniqueValues).map((v) => JSON.parse(v));
  }

  const tree = StandardMerkleTree.of(allValues, ["address", "uint8"]); // Level as uint8

  await MerkleTreeModel.deleteMany();
  const merkleTree = new MerkleTreeModel({
    root: tree.root,
    treeData: tree.dump(),
  });
  await merkleTree.save();

  return tree.root;
}

export async function fetchMerkleProof(address: string, level: number) {
  const merkleTree = await MerkleTreeModel.findOne();
  if (!merkleTree) return null;

  const tree = StandardMerkleTree.load(merkleTree.treeData);
  for (const [i, v] of tree.entries()) {
    if (v[0] === address && v[1] === level) {
      return tree.getProof(i);
    }
  }
  return null;
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
