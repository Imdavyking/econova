import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../config/logger";

dotenv.config();

const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(BOT_PRIVATE_KEY, provider);
const AUTOMATION_INTERVAL = 60000;

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

const abiDecodeString = (data: string): string | null => {
  try {
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(["string"], data);
    return decodedData[0];
  } catch (error) {
    return null;
  }
};

async function handleCharityWithdrawal(index: number, charityAddress: string) {
  try {
    if (charityAddress === ethers.ZeroAddress) {
      logger.info(`Charity ${index} does not exist.`);
      return;
    }

    const charityInstance = new ethers.Contract(
      charityAddress,
      charityAbi,
      wallet
    );
    const [canExec, execPayload] = await charityInstance.checker();

    if (!canExec) {
      const abiResult = abiDecodeString(execPayload);
      if (abiResult) {
        logger.info(
          `Charity ${index} (${charityAddress}) has a message: ${abiResult}`
        );
      } else {
        logger.info(
          `Charity ${index} (${charityAddress}) execPayload: ${ethers.hexlify(
            execPayload
          )}`
        );
      }
      return;
    }

    const tx = await wallet.sendTransaction({
      to: charityAddress,
      data: execPayload,
    });

    logger.info(
      `Transaction sent for Charity ${index} (${charityAddress}): ${tx.hash}`
    );
    await tx.wait();
    logger.info(
      `Withdrawal executed successfully for Charity ${index} (${charityAddress})`
    );
  } catch (error) {
    logger.error(
      `Automation failed for Charity ${index} (${charityAddress}):`,
      error
    );
  }
}

export async function automateCharityFundDistrubtion() {
  try {
    const charityLength = await ecoNovaManagerContract.charityLength();
    const charityPromises: Promise<void>[] = [];

    for (let i = 0; i < charityLength; i++) {
      const charityAddress = await ecoNovaManagerContract.charityOrganizations(
        i
      );
      charityPromises.push(handleCharityWithdrawal(i, charityAddress));
    }

    await Promise.all(charityPromises);
  } catch (error) {
    logger.error("Automation script failed:", error);
  }

  setTimeout(automateCharityFundDistrubtion, AUTOMATION_INTERVAL);
}
