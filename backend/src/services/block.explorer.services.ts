import dotenv from "dotenv";
import { environment } from "../utils/config";
dotenv.config();

export const getVerifiedContractCode = async (
  address: string
): Promise<{
  contractName: string;
  sourceCode: string;
  abi: string;
}> => {
  const response = await fetch(
    `https://api-testnet.sonicscan.org/api?module=contract&action=getsourcecode&address=${address}&apikey=${environment.API_SCAN_VERIFIER_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch contract code");
  }
  const data = await response.json();
  return {
    contractName: data.result[0].ContractName,
    sourceCode: data.result[0].SourceCode,
    abi: data.result[0].ABI,
  };
};
