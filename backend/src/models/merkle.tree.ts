import mongoose from "mongoose";
const MerkleTreeSchema = new mongoose.Schema({
  root: String,
  treeData: Object,
  createdAt: { type: Date, default: Date.now },
});

export const MerkleTreeModel = mongoose.model("MerkleTree", MerkleTreeSchema);
