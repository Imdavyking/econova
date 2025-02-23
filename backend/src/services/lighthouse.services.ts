import lighthouse from "@lighthouse-web3/sdk";
import dotenv from "dotenv";
import { environment } from "../utils/config";
dotenv.config();

export const uploadToIPFS = async (data: Buffer) => {
  const uploadResponse = await lighthouse.uploadBuffer(
    data,
    environment.LIGHTHOUSE_API_KEY!
  );
  return `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`;
};
