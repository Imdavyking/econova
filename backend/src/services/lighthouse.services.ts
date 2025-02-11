import lighthouse from "@lighthouse-web3/sdk";
import dotenv from "dotenv";
dotenv.config();

export const uploadToIPFS = async (data: Buffer) => {
  const uploadResponse = await lighthouse.uploadBuffer(
    data,
    process.env.LIGHTHOUSE_API_KEY!
  );
  return `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`;
};
