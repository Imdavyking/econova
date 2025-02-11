import { Request, Response } from "express";
import {
  saveMerkleRoot,
  signUserLevelWithRoot,
} from "../services/merkle.proof.services";
import { ethers } from "ethers";
import { uploadToIPFS } from "../services/lighthouse.services";
import fs from "fs";
import path from "path";

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

    const messageHash = ethers.solidityPackedKeccak256(["uint8"], [level]);

    const ethSignedMessageHash = ethers.hashMessage(
      ethers.getBytes(messageHash)
    );

    const address = ethers.recoverAddress(
      ethSignedMessageHash,
      courseSignature
    );

    const levelName = Level[level];

    if (!levelName) {
      res.status(400).json({ error: "Invalid level" });
      return;
    }

    const imageSrc = path
      .join(__dirname, "../public", "images", `${levelName}-certificate.webp`)
      .replace("build", "src");

    // /opt/render/project/src/backend/build/public/images/Beginner-certificate.webp
    // /opt/render/project/src/backend/src/public/images/Beginner-certificate.webp

    if (!fs.existsSync(imageSrc)) {
      res
        .status(500)
        .json({ error: `Certificate image not found ${imageSrc}` });
      return;
    }

    const imageBuffer = fs.readFileSync(imageSrc);
    const imageHash = await uploadToIPFS(imageBuffer);

    if (!imageHash) {
      res.status(500).json({ error: "Failed to upload image to IPFS" });
      return;
    }

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
      ],
    };

    const jsonBuffer = Buffer.from(JSON.stringify(userNFTMetaData, null, 2));

    const [tokenURI, { root, proof }] = await Promise.all([
      uploadToIPFS(jsonBuffer),
      saveMerkleRoot(address, +level),
    ]);

    const { signature, timestamp } = await signUserLevelWithRoot(
      address,
      level,
      root
    );

    res.json({
      level,
      root,
      proof,
      timestamp,
      signature,
      tokenURI,
      imageHash,
    });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error?.message });
  }
};
