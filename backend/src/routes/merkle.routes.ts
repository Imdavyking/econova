import express from "express";
import {
  storeMerkleRoot,
  getMerkleProof,
} from "../controllers/merkle.controllers";

const router = express.Router();

// Route to store a new Merkle root (add a value)
router.post("/merkle/store", storeMerkleRoot);

// Route to get a Merkle proof for an address and level
router.get("/merkle/proof/:address/:level", getMerkleProof);

export default router;
