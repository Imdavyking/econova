import { Request, Response } from "express";
import {
  saveMerkleRoot,
  fetchMerkleProof,
} from "../services/merkle.proof.services";

/**
 * Stores a new value in the Merkle tree and updates the root.
 */
export const storeMerkleRoot = async (req: Request, res: Response) => {
  try {
    const { address, level }: { address: string; level: number } = req.body;
    if (!address || level === undefined) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const treeRoot = await saveMerkleRoot([address, +level]);

    res.json({ root: treeRoot, message: "Merkle root updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error });
  }
};

/**
 * Retrieves a Merkle proof for a given address and level.
 */
export const getMerkleProof = async (req: Request, res: Response) => {
  try {
    const { address, level } = req.params;

    if (!address || isNaN(Number(level))) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const proof = await fetchMerkleProof(address, +level);

    if (proof) {
      res.json({ proof });
      return;
    }

    res
      .status(404)
      .json({ error: "Proof not found for this address and level" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error });
  }
};
