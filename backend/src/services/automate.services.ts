import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../config/logger";
import { environment } from "../utils/config";
import { initKeystore } from "../utils/init.keystore";
import { ETH_ADDRESS, MULTICALL3_CONTRACT_ADDRESS } from "../utils/constants";
import io from "../utils/create.websocket";

dotenv.config();

const RPC_URL = environment.RPC_URL!;
const CONTRACT_ADDRESS = environment.CONTRACT_ADDRESS!;
const API_BROWSER_URL = environment.API_BROWSER_URL!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = initKeystore(provider);
const AUTOMATION_INTERVAL = 60000;

const ecoNovaManagerInterface = new ethers.Interface([
  "function charityLength() external view returns (uint256)",
  "function charityOrganizations(uint8) external view returns (address)",
]);

const erc20Abi = [
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
];

const charityInterface = new ethers.Interface([
  "function checker() external view returns (bool canExec, bytes memory execPayload)",
]);

const multicallAbiInterface = new ethers.Interface([
  "function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)",
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  "function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  "function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)",
  "function getBasefee() view returns (uint256 basefee)",
  "function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)",
  "function getBlockNumber() view returns (uint256 blockNumber)",
  "function getChainId() view returns (uint256 chainid)",
  "function getCurrentBlockCoinbase() view returns (address coinbase)",
  "function getCurrentBlockDifficulty() view returns (uint256 difficulty)",
  "function getCurrentBlockGasLimit() view returns (uint256 gaslimit)",
  "function getCurrentBlockTimestamp() view returns (uint256 timestamp)",
  "function getEthBalance(address addr) view returns (uint256 balance)",
  "function getLastBlockHash() view returns (bytes32 blockHash)",
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
  "function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)",
]);

const ecoNovaManagerContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ecoNovaManagerInterface,
  wallet
);

const batchMulticall = async (queries: any[]) => {
  try {
    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error("Invalid queries array");
    }

    const multicall3 = await new ethers.Contract(
      MULTICALL3_CONTRACT_ADDRESS,
      multicallAbiInterface,
      wallet
    );

    const { calls, totalValue } = queries.reduce(
      (acc, query) => {
        acc.totalValue += query.value ?? 0;
        acc.calls.push({
          target: query.target,
          callData: query.callData,
          value: query.value ?? 0,
          allowFailure: query.allowFailure ?? false,
        });
        return acc;
      },
      { calls: [], totalValue: 0 }
    );

    const results = await multicall3.aggregate3Value.staticCall(calls, {
      value: totalValue,
    });

    return results;
  } catch (error) {
    console.error("Batch query failed:", error);
    throw error;
  }
};

const decodeNonExecPayload = (data: string): string | null => {
  try {
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(["string"], data);
    return decodedData[0] || null;
  } catch (error: any) {
    logger.error(`Failed to decode execPayload: ${error.message}`);
    return null;
  }
};

const decodeExecPayload = (data: string): any | null => {
  try {
    const abi = [
      "function withdrawToOrganization(address token, uint256 amount, address[] organizations)",
    ];

    const iface = new ethers.Interface(abi);

    const decodedData = iface.decodeFunctionData(
      "withdrawToOrganization",
      data
    );

    return {
      token: decodedData[0],
      amount: decodedData[1].toString(),
      organizations: decodedData[2],
    };
  } catch (error: any) {
    logger.error(`Failed to decode execPayload: ${error.message}`);
    return null;
  }
};

const getTokenDetails = async (
  token: string,
  rawAmount: bigint
): Promise<{ amount: string; name: string }> => {
  if (token === ETH_ADDRESS) {
    return {
      amount: ethers.formatEther(rawAmount),
      name: "ETH",
    };
  }

  try {
    const tokenContract = new ethers.Contract(token, erc20Abi, provider);
    const [name, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.decimals(),
    ]);

    const amount = ethers.formatUnits(rawAmount, decimals);
    return { amount, name };
  } catch (error: any) {
    console.error(`Failed to fetch token details: ${error.message}`);
    return { amount: rawAmount.toString(), name: "Unknown Token" };
  }
};

async function handleCharityWithdrawal(index: number, charityAddress: string) {
  try {
    if (charityAddress === ethers.ZeroAddress) {
      logger.info(`Charity ${index} does not exist.`);
      io.emit("charity:update", {
        index,
        shouldToast: false,
        message: "Charity does not exist",
      });
      return;
    }

    const charityInstance = new ethers.Contract(
      charityAddress,
      charityInterface,
      wallet
    );

    let [canExec, execPayload] = await charityInstance.checker();

    if (!canExec) {
      const message = decodeNonExecPayload(execPayload);
      const logMessage = message
        ? `Reason: ${message}`
        : `execPayload (hex): ${ethers.hexlify(execPayload)}`;

      logger.info(`Charity ${index} (${charityAddress}) - ${logMessage}`);
      io.emit("charity:update", {
        index,
        shouldToast: false,
        message: logMessage,
      });
      return;
    }

    const { token, amount, organizations } = decodeExecPayload(execPayload);

    const { amount: tokenAmount, name } = await getTokenDetails(
      token,
      BigInt(amount)
    );

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

    io.emit("charity:update", {
      index,
      shouldToast: true,
      message: `Withdrawing ${tokenAmount} ${name} to ${organizations.length} 
        organization${organizations.length > 1 ? "s" : ""}.
        Transaction: ${API_BROWSER_URL}/tx/${tx.hash}.
        Charity Address: ${API_BROWSER_URL}/address/${charityAddress}.`,
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

    const charityCalls = Array.from(
      { length: Number(charityLength) },
      (_, i) => ({
        target: CONTRACT_ADDRESS,
        callData: ecoNovaManagerInterface.encodeFunctionData(
          "charityOrganizations",
          [i]
        ),
      })
    );

    const results: any = await batchMulticall(charityCalls);

    const charityAddresses: string[] = results.map(
      ({ success, returnData }: { success: boolean; returnData: string }) =>
        success
          ? ecoNovaManagerInterface.decodeFunctionResult(
              "charityOrganizations",
              returnData
            )[0]
          : "0x00"
    );

    const charityPromises = charityAddresses.map((charityAddress, index) =>
      handleCharityWithdrawal(index, charityAddress)
    );

    await Promise.allSettled(charityPromises);
  } catch (error) {
    logger.error("Automation script failed:", error);
  }

  setTimeout(automateCharityFundDistribution, AUTOMATION_INTERVAL);
}
