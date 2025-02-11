import lighthouse from "@lighthouse-web3/sdk";
import dotenv from "dotenv";
dotenv.config();

const lightHouseApiKey = process.env.LIGHTHOUSE_API_KEY!;
export const uploadJSONMetaData = async (jsonMetaData: string) => {
  const uploadResponse = await lighthouse.upload(
    jsonMetaData,
    lightHouseApiKey,
    undefined
  );
  return `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`;
};
