import mongoose from "mongoose";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const MerkleTreeSchema = new mongoose.Schema({
  root: String,
  treeData: Object,
  createdAt: { type: Date, default: Date.now },
});

const MerkleTreeModel = mongoose.model("MerkleTree", MerkleTreeSchema);

async function storeMerkleRoot(values: (string | number)[][]) {
  const tree = StandardMerkleTree.of(values, ["address", "uint8"]); // Level as uint8
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
// (async () => {
//   const values = [
//     ["0x1111111111111111111111111111111111111111", 0], // Beginner
//     ["0x2222222222222222222222222222222222222222", 1], // Intermediate
//   ];

//   const root = await storeMerkleRoot(values);
//   console.log("Stored Merkle Root:", root);

//   const proof = await getMerkleProof(
//     "0x1111111111111111111111111111111111111111",
//     0
//   );
//   console.log("Proof for Beginner Level:", proof);

//   mongoose.connection.close();
// })();
