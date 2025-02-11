import { Request, Response } from "express";
import {
  saveMerkleRoot,
  fetchMerkleProof,
  signUserLevelWithRoot,
} from "../services/merkle.proof.services";
import { ethers } from "ethers";
import { uploadToIPFS } from "../services/lighthouse.services";
import fs from "fs";

enum Level {
  Beginner,
  Intermediate,
  Advanced,
}
/**
 * Stores a new value in the Merkle tree and updates the root.
 */
export const storeMerkleRoot = async (req: Request, res: Response) => {
  try {
    const {
      courseSignature,
      level,
      scoreInPercentage,
    }: { courseSignature: string; level: number; scoreInPercentage: number } =
      req.body;

    if (
      !courseSignature ||
      level === undefined ||
      scoreInPercentage === undefined
    ) {
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

    const levelName = Level[level];

    const imageSrc = `./public/images/${levelName}-certificate.webp`;

    // get image buffer
    const imageBuffer = fs.readFileSync(imageSrc);
    const imageHash = await uploadToIPFS(imageBuffer);

    const userNFTMetaData = {
      name: `EcoNova ${levelName} Course NFT`,
      description: `This NFT certifies that the holder has successfully completed the EcoNova ${levelName} Course on blockchain and DeFAI.`,
      image: imageHash,
      attributes: [
        {
          trait_type: "Course Level",
          value: levelName,
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
          value: `${scoreInPercentage}%`,
        },
        {
          trait_type: "Certificate ID",
          value: "ECNFT-1001",
        },
      ],
    };

    const jsonBuffer = Buffer.from(JSON.stringify(userNFTMetaData, null, 2));

    const tokenURI = await uploadToIPFS(jsonBuffer);

    const root = await saveMerkleRoot([address, +level]);

    const { signature, timestamp } = await signUserLevelWithRoot(
      address,
      level,
      root
    );

    res.json({
      level,
      root,
      timestamp,
      signature,
      tokenURI,
    });
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
