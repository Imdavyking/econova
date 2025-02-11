import { Request, Response } from "express";
import {
  saveMerkleRoot,
  fetchMerkleProof,
} from "../services/merkle.proof.services";
import { ethers } from "ethers";
import { uploadJSONMetaData } from "../services/lighthouse.services";

/**
 * Stores a new value in the Merkle tree and updates the root.
 */
export const storeMerkleRoot = async (req: Request, res: Response) => {
  try {
    const {
      courseSignature,
      level,
    }: { courseSignature: string; level: number } = req.body;

    if (!courseSignature || level === undefined) {
      res.status(400).json({ error: "Invalid input data" });
      return;
    }

    const messageHash = ethers.solidityPackedKeccak256(["uint256"], [level]);

    const ethSignedMessageHash = ethers.hashMessage(
      ethers.getBytes(messageHash)
    );

    const address = ethers.recoverAddress(
      ethSignedMessageHash,
      courseSignature
    );

    const treeRoot = await saveMerkleRoot([address, +level]);

    const userNFTMetaData = {
      name: "EcoNova Beginner Course NFT",
      description:
        "This NFT certifies that the holder has successfully completed the EcoNova Beginner Course on sustainable living and green energy.",
      image: "ipfs://QmExampleHash123456789/image.png",
      attributes: [
        {
          trait_type: "Course Level",
          value: "Beginner",
        },
        {
          trait_type: "Completion Date",
          value: new Date().toDateString(),
        },
        {
          trait_type: "Instructor",
          value: "AI Tutor",
        },
        {
          trait_type: "Score",
          value: "95%",
        },
        {
          trait_type: "Certificate ID",
          value: "ECNFT-1001",
        },
      ],
    };

    const jsonBuffer = Buffer.from(JSON.stringify(userNFTMetaData, null, 2));

    uploadJSONMetaData(JSON.stringify(userNFT));

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
