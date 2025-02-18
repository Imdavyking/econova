import { evm } from "@debridge-finance/desdk";
import { ethers } from "ethers";
import { getBridgeContract, getSigner } from "./blockchain.services";
import { Flags } from "@debridge-finance/desdk/lib/evm";
import { FAILED_KEY } from "../utils/constants";
import { sonic, bsc } from "viem/chains";

const supportedChains = [sonic, bsc];
const TX_HASH_LOCAL_STORAGE_KEY = "debridge_tx_info";

const getProviderByChainId = (chainId) =>
  supportedChains.find((chain) => chain.id === chainId)?.rpcUrls[0];

const isSupported = (chainId) =>
  supportedChains.some((chain) => chain.id === chainId);

const storeTxInfo = (txHash, chainIdFrom, chainIdTo) => {
  txHash
    ? localStorage.setItem(
        TX_HASH_LOCAL_STORAGE_KEY,
        JSON.stringify({ txHash, chainIdFrom, chainIdTo })
      )
    : localStorage.removeItem(TX_HASH_LOCAL_STORAGE_KEY);
};

const getTxInfo = () =>
  JSON.parse(localStorage.getItem(TX_HASH_LOCAL_STORAGE_KEY)) || {};

const getTxStatus = async ({ txHash, chainIdFrom, chainIdTo }) => {
  try {
    const originProvider = getProviderByChainId(chainIdFrom);
    const destProvider = getProviderByChainId(chainIdTo);

    if (!originProvider || !destProvider) throw new Error("Unsupported chain");

    const [submission] = await evm.Submission.findAll(txHash, {
      provider: originProvider,
    });
    if (!submission) return [0, 0];

    if (!(await submission.hasRequiredBlockConfirmations())) return [0, 0];

    const claim = await submission.toEVMClaim({ provider: destProvider });
    return [
      await claim.getSignatures().length,
      await claim.getRequiredSignaturesCount(),
    ];
  } catch (error) {
    console.error("Error getting transaction status:", error);
    return [0, 0];
  }
};

export async function getBridgeFee(chainIdFrom) {
  try {
    return await (await getBridgeContract(chainIdFrom)).globalFixedNativeFee();
  } catch (error) {
    console.error("Error getting bridge fee:", error);
    return `${FAILED_KEY} to get bridge fee: ${error.message}`;
  }
}

async function bridgeCoin({ bridgeAmount, chainIdFrom, chainIdTo, receiver }) {
  try {
    if (![chainIdFrom, chainIdTo].every(isSupported))
      throw new Error(`Unsupported chain(s): ${chainIdFrom}, ${chainIdTo}`);

    const [deBridgeGate, signer] = await Promise.all([
      getBridgeContract(chainIdFrom),
      getSigner(),
    ]);

    receiver ||= await signer.getAddress();
    const userBalance = await signer.provider.getBalance(receiver);
    const bridgeAmountWei = ethers.parseEther(bridgeAmount);
    const fee = await deBridgeGate.globalFixedNativeFee();
    const etherToSend = fee + bridgeAmountWei;

    if (userBalance < etherToSend) throw new Error("Insufficient balance");

    const message = new evm.Message({
      tokenAddress: ethers.ZeroAddress,
      amount: bridgeAmountWei.toString(),
      chainIdTo,
      receiver,
      autoParams: new evm.SendAutoParams({
        executionFee: "0",
        fallbackAddress: receiver,
        flags: new Flags(),
        data: "0x",
      }),
    });

    const tx = await deBridgeGate.send(...message.getEncodedArgs(), {
      value: etherToSend.toString(),
    });
    storeTxInfo(tx.hash, chainIdFrom, chainIdTo);

    return `Transaction sent: ${tx.hash}`;
  } catch (error) {
    console.error("Error gotten while trying to bridge coin:", error);
    return `${FAILED_KEY} to bridge coin: ${error.message}`;
  }
}

const claim = async ({ txHash, chainIdFrom, chainIdTo }) => {
  try {
    if (![chainIdFrom, chainIdTo].every(isSupported))
      throw new Error(`Unsupported chain(s): ${chainIdFrom}, ${chainIdTo}`);

    const [originProvider, destProvider] = [chainIdFrom, chainIdTo].map(
      getProviderByChainId
    );

    const [submission] = await evm.Submission.findAll(txHash, {
      provider: originProvider,
    });
    if (!submission) throw new Error("Invalid submission");

    if (!(await submission.hasRequiredBlockConfirmations()))
      throw new Error("Not yet confirmed!");

    const claim = await submission.toEVMClaim({ provider: destProvider });

    if (!(await claim.isSigned())) throw new Error("Not yet signed!");
    if (await claim.isExecuted()) throw new Error("Already executed!");

    const tx = await (
      await getBridgeContract()
    ).claim(...(await claim.getEncodedArgs()));
    await tx.wait();

    storeTxInfo(null, null, null);
    return `Successfully claimed cross-chain Ether: ${tx.hash}`;
  } catch (error) {
    console.error("Error claiming cross-chain Ether:", error);
    return `${FAILED_KEY} to claim cross-chain Ether: ${error.message}`;
  }
};

export { getTxStatus, bridgeCoin, claim };
