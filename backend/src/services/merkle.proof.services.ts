import mongoose from "mongoose";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const MerkleTreeSchema = new mongoose.Schema({
  root: String,
  treeData: Object,
  createdAt: { type: Date, default: Date.now },
});

const MerkleTreeModel = mongoose.model("MerkleTree", MerkleTreeSchema);

async function storeMerkleRoot(newValue: [string, number]) {
  const existingMerkleTree = await MerkleTreeModel.findOne();
  let allValues: [string, number][] = [newValue];

  if (existingMerkleTree) {
    const existingTree = StandardMerkleTree.load(existingMerkleTree.treeData);
    const existingValues = Array.from(existingTree.entries()).map(
      ([_, v]) => v
    );

    // Append new value while avoiding duplicates
    const uniqueValues = new Set(existingValues.map((v) => JSON.stringify(v)));
    uniqueValues.add(JSON.stringify(newValue));

    // Convert back to an array
    allValues = Array.from(uniqueValues).map((v) => JSON.parse(v));
  }

  // Create new Merkle tree
  const tree = StandardMerkleTree.of(allValues, ["address", "uint8"]); // Level as uint8

  // Save updated tree to the database
  await MerkleTreeModel.deleteMany(); // Clear old data
  const merkleTree = new MerkleTreeModel({
    root: tree.root,
    treeData: tree.dump(),
  });
  await merkleTree.save();

  return tree.root;
}

async function getMerkleProof(address: string, level: number) {
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

// Example Usage
(async () => {
  const newValue: [string, number] = [
    "0x4444444444444444444444444444444444444444",
    3,
  ]; // Master Level

  const root = await storeMerkleRoot(newValue);
  console.log("Updated Merkle Root:", root);

  const proof = await getMerkleProof(
    "0x4444444444444444444444444444444444444444",
    3
  );
  console.log("Proof for Master Level:", proof);

  mongoose.connection.close();
})();
