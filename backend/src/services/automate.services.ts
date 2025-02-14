import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../config/logger";

dotenv.config();

const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(BOT_PRIVATE_KEY, provider);

const charityAbi: string[] = [
  "function checker() external view returns (bool canExec, bytes memory execPayload)",
];

const ecoNovaManagerAbi: string[] = [
  "function charityLength() external view returns (uint256)",
  "function charityOrganizations(uint8) external view returns (address)",
];

const ecoNovaManagerContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ecoNovaManagerAbi,
  wallet
);

export async function automateWithdraw() {
  try {
    const charityLength = await ecoNovaManagerContract.charityLength();

    for (let i = 0; i < charityLength; i++) {
      const charityAddress = await ecoNovaManagerContract.charityOrganizations(
        i
      );

      if (charityAddress === ethers.ZeroAddress) {
        logger.info(`Charity ${i} does not exist.`);
        continue;
      }

      const charityInstance = new ethers.Contract(
        charityAddress,
        charityAbi,
        wallet
      );
      const [canExec, execPayload] = await charityInstance.checker();

      if (!canExec) {
        logger.info(`execPayload: ${ethers.decodeBytes32String(execPayload)}`);
        continue;
      }

      const tx = await wallet.sendTransaction({
        to: charityAddress,
        data: execPayload,
      });

      logger.info(
        `Transaction sent for Charity ${i} (${charityAddress}): ${tx.hash}`
      );
      await tx.wait();
      logger.info(
        `Withdrawal executed successfully for Charity ${i} (${charityAddress})`
      );
    }
  } catch (error) {
    logger.error("Automation script failed:", error);
  }

  setTimeout(automateWithdraw, 60000);
}
