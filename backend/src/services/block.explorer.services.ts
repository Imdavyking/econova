import dotenv from "dotenv";
dotenv.config();

export const getVerifiedContractCode = async (
  address: string
): Promise<string> => {
  const response = await fetch(
    `https://api-testnet.sonicscan.org/api?module=contract&action=getsourcecode&address=${address}&apikey=${process.env.API_SCAN_VERIFIER_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch contract code");
  }
  const data = await response.json();
  return data.result[0].SourceCode;
};
