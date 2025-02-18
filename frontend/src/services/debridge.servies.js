import { evm } from "@debridge-finance/desdk";
import { ethers } from "ethers";
import { getBridgeContract, getSigner } from "./blockchain.services";
import { DEFAULT_DEBRIDGE_GATE_ADDRESS } from "@debridge-finance/desdk/lib/evm/context";
import { Flags } from "@debridge-finance/desdk/lib/evm";
import { FAILED_KEY } from "../utils/constants";

const debridgeAbi = [
  "function send(address _tokenAddress,uint256 _amount,uint256 _chainIdTo,bytes _receiver,bytes _permitEnvelope,bool _useAssetFee,uint32 _referralCode,bytes _autoParams) external payable returns (bytes32)",
  "function claim(bytes32 _debridgeId,uint256 _amount,uint256 _chainIdFrom,address _receiver,uint256 _nonce,bytes calldata _signatures,bytes calldata _autoParams) external",
  "function globalFixedNativeFee() view returns (uint256)",
];

const chainIdToInfo = {
  56: {
    chainId: 56,
    chainName: "Binance Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
  },
  146: {
    chainId: 146,
    chainName: "Sonic Mainnet",
    nativeCurrency: {
      name: "SONIC",
      symbol: "SONIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.soniclabs.com"],
    blockExplorerUrls: ["https://sonicscan.io/"],
  },
};

const isSupported = (chainId) => {
  return !!chainIdToInfo[chainId];
};

const TX_HASH_LOCAL_STORAGE_KEY = "debridge_tx_info";
const storeTxInfo = (txHash, chainIdFrom, chainIdTo) => {
  if (txHash) {
    localStorage.setItem(
      TX_HASH_LOCAL_STORAGE_KEY,
      JSON.stringify({ txHash, chainIdFrom, chainIdTo })
    );
  } else {
    localStorage.removeItem(TX_HASH_LOCAL_STORAGE_KEY);
  }
};

const getTxInfo = () => {
  const content = localStorage.getItem(TX_HASH_LOCAL_STORAGE_KEY);
  return content
    ? JSON.parse(content)
    : { txHash: null, chainIdFrom: null, chainIdTo: null };
};

const getTxStatus = async ({ txHash, chainIdFrom, chainIdTo }) => {
  try {
    const evmOriginContext = {
      provider: chainIdToInfo[chainIdFrom].rpcUrls[0],
    };

    const submissions = await evm.Submission.findAll(txHash, evmOriginContext);
    const evmDestinationContext = {
      provider: chainIdToInfo[chainIdTo].rpcUrls[0],
    };

    const [submission] = submissions;
    const isConfirmed = await submission.hasRequiredBlockConfirmations();

    if (!isConfirmed) {
      return [0, 0];
    }

    const claim = await submission.toEVMClaim(evmDestinationContext);
    const minRequiredSignatures = await claim.getRequiredSignaturesCount();

    if (!isConfirmed) {
      return [0, minRequiredSignatures];
    }

    const signatures = await claim.getSignatures();
    return [signatures.length, minRequiredSignatures];
  } catch (error) {
    console.error("Error getting transaction status:", error);
    return [0, 0];
  }
};

// Bridge service to send tokens
async function bridgeSonicService({ bridgeAmount, chainIdTo }) {
  try {
    const deBridgeGate = await getBridgeContract();
    const signer = await getSigner();
    const chainIdFrom = await signer.provider.provider.send("eth_chainId", []);

    if (!isSupported(chainIdFrom)) {
      throw Error(`Chain ID: ${chainIdFrom} is not supported`);
    }

    if (!isSupported(chainIdTo)) {
      throw Error(`Chain ID: ${chainIdTo} is not supported`);
    }

    const receiver = await signer.getAddress();

    const message = new evm.Message({
      tokenAddress: "0x0000000000000000000000000000000000000000",
      amount: ethers.utils.parseEther(bridgeAmount).toString(),
      chainIdTo,
      receiver,
      autoParams: new evm.SendAutoParams({
        executionFee: "0",
        fallbackAddress: receiver,
        flags: new Flags(),
        data: "0x",
      }),
    });

    const argsForSend = message.getEncodedArgs();
    const fee = await deBridgeGate.globalFixedNativeFee();
    const etherToSend = fee.add(ethers.utils.parseEther(bridgeAmount));

    const tx = await deBridgeGate.send(...argsForSend, { value: etherToSend });
    const receipt = await tx.wait();

    storeTxInfo(receipt.transactionHash, chainIdFrom, chainIdTo);

    console.log(`Transaction sent: ${tx.hash}`);
    return `Transaction sent: ${tx.hash}`;
  } catch (error) {
    console.error("Error sending cross-chain Ether:", error);
    return `${FAILED_KEY} to send cross-chain Ether: ${error.message}`;
  }
}

// Claim function for cross-chain claims
const claim = async ({ txHash, chainIdFrom, chainIdTo }) => {
  try {
    if (!isSupported(chainIdFrom)) {
      throw Error(`Chain ID: ${chainIdFrom} is not supported`);
    }

    if (!isSupported(chainIdTo)) {
      throw Error(`Chain ID: ${chainIdTo} is not supported`);
    }

    const evmOriginContext = {
      provider: chainIdToInfo[chainIdFrom].rpcUrls[0],
    };

    const submissions = await evm.Submission.findAll(txHash, evmOriginContext);

    if (submissions.length === 0 || submissions.length > 1) {
      throw Error("Invalid submission count");
    }

    const [submission] = submissions;
    const isConfirmed = await submission.hasRequiredBlockConfirmations();

    if (!isConfirmed) {
      throw Error("Not yet confirmed!");
    }

    const evmDestinationContext = {
      provider: chainIdToInfo[chainIdTo].rpcUrls[0],
    };

    const claim = await submission.toEVMClaim(evmDestinationContext);
    const isSigned = await claim.isSigned();
    const isExecuted = await claim.isExecuted();

    if (!isSigned) {
      throw Error("Not yet signed!");
    }
    if (isExecuted) {
      storeTxInfo(null, null, null);
      throw Error("Already executed!");
    }

    const signer = await getSigner();
    const claimArgs = await claim.getEncodedArgs();

    const deBridgeGate = new ethers.Contract(
      DEFAULT_DEBRIDGE_GATE_ADDRESS,
      debridgeAbi,
      signer
    );
    const tx = await deBridgeGate.claim(...claimArgs);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      storeTxInfo(null, null, null);
    }

    return `Successfully claimed cross-chain Ether: ${tx.hash}`;
  } catch (error) {
    console.error("Error claiming cross-chain Ether:", error);
    return `${FAILED_KEY} to claim cross-chain Ether: ${error.message}`;
  }
};

export { getTxStatus, bridgeSonicService, claim };
