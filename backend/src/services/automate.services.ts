import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../config/logger";
import { environment } from "../utils/config";
import { initKeystore } from "../utils/init.keystore";

dotenv.config();

const RPC_URL = environment.RPC_URL!;
const CONTRACT_ADDRESS = environment.CONTRACT_ADDRESS!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = initKeystore(provider);
const AUTOMATION_INTERVAL = 60000;

const ecoNovaManagerInterface = new ethers.Interface([
  "function charityLength() external view returns (uint256)",
  "function charityOrganizations(uint8) external view returns (address)",
]);

const charityInterface = new ethers.Interface([
  "function checker() external view returns (bool canExec, bytes memory execPayload)",
]);

const ecoNovaManagerContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ecoNovaManagerInterface,
  wallet
);

const decodeExecPayload = (data: string): string | null => {
  try {
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(["string"], data);
    return decodedData[0] || null;
  } catch (error: any) {
    logger.error(`Failed to decode execPayload: ${error.message}`);
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
      charityInterface,
      wallet
    );

    const [canExec, execPayload] = await charityInstance.checker();

    if (!canExec) {
      const message = decodeExecPayload(execPayload);
      if (message) {
        logger.info(
          `Charity ${index} (${charityAddress}) - Reason: ${message}`
        );
      } else {
        logger.info(
          `Charity ${index} (${charityAddress}) execPayload (hex): ${ethers.hexlify(
            execPayload
          )}`
        );
      }
      return;
    }

    const gasEstimate = await provider.estimateGas({
      from: wallet.address,
      to: charityAddress,
      data: execPayload,
    });

    const tx = await wallet.sendTransaction({
      to: charityAddress,
      data: execPayload,
      gasLimit: (gasEstimate * 12n) / 10n,
    });

    logger.info(
      `Transaction sent for Charity ${index} (${charityAddress}): ${tx.hash}`
    );

    await tx.wait();
    logger.info(
      `Withdrawal executed successfully for Charity ${index} (${charityAddress})`
    );
  } catch (error: any) {
    logger.error(
      `Automation failed for Charity ${index} (${charityAddress}): ${error.message}`
    );
  }
}

export async function automateCharityFundDistribution() {
  try {
    const charityLength = await ecoNovaManagerContract.charityLength();

    const charityCalls = Array.from({ length: Number(charityLength) }, (_, i) =>
      ecoNovaManagerContract.charityOrganizations(i)
    );

    const charityAddresses = await Promise.all(charityCalls);

    const charityPromises = charityAddresses.map((charityAddress, index) =>
      handleCharityWithdrawal(index, charityAddress)
    );

    await Promise.allSettled(charityPromises);
  } catch (error) {
    logger.error("Automation script failed:", error);
  }

  setTimeout(automateCharityFundDistribution, AUTOMATION_INTERVAL);
}
