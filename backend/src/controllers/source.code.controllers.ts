import { Request, Response } from "express";
import { getVerifiedContractCode } from "../services/block.explorer.services";

export const getVerifiedSourceCode = async (req: Request, res: Response) => {
  try {
    const { contractAddress } = req.body;
    if (!contractAddress) {
      res.status(400).json({ error: "Missing contractAddress" });
      return;
    }

    const { contractName, sourceCode, abi } = await getVerifiedContractCode(
      contractAddress as string
    );
    res.json({ contractName, sourceCode, abi });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
