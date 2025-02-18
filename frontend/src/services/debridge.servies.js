import { evm } from "@debridge-finance/desdk";
import { ethers } from "ethers";
import { getSigner } from "./blockchain.services";
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
      symbol: "S",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.soniclabs.com"],
    blockExplorerUrls: ["https://sonicscan.io/"],
  },
};

const switchBridgeChainId = async (ethProvider, sourceChainId) => {
  try {
    const chainId = await ethProvider.provider.send("eth_chainId", []);
    console.log(`Current chainId: ${Number(chainId)}`);

    if (Number(chainId) !== Number(sourceChainId)) {
      try {
        await ethProvider.provider.send("wallet_switchEthereumChain", [
          { chainId: sourceChainId },
        ]);
      } catch (error) {
        if (error.code === 4902) {
          await ethProvider.provider.send("wallet_addEthereumChain", [
            chainIdToInfo[sourceChainId],
          ]);
        } else {
          console.error(`${FAILED_KEY} to switch to ${sourceChainId}:`, error);
        }
      }
    } else {
      console.log(`Already connected to chainId: ${sourceChainId}`);
    }
  } catch (error) {}
};

const isSupported = (chainId) => {
  if (chainIdToInfo[chainId]) {
    return true;
  }

  return;
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
  if (content) {
    return JSON.parse(localStorage.getItem(TX_HASH_LOCAL_STORAGE_KEY));
  } else {
    return { txHash: null, chainIdFrom: null, chainIdTo: null };
  }
};
const getTxStatus = async ({ txHash, chainIdFrom, chainIdTo }) => {
  try {
    const evmOriginContext = {
      provider: rpcNodes[chainIdFrom],
    };

    const submissions = await evm.Submission.findAll(txHash, evmOriginContext);

    const evmDestinationContext = {
      provider: rpcNodes[chainIdTo],
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
  } catch {
    return [0, 0];
  }
};

const getBridgeContract = async (chainIdTo) => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchBridgeChainId(signer.provider, +chainIdTo);
  return new ethers.Contract(
    DEFAULT_DEBRIDGE_GATE_ADDRESS,
    debridgeAbi,
    signer
  );
};

async function bridgeService({ bridgeAmount, chainIdTo }) {
  try {
    const deBridgeGate = await getBridgeContract(chainIdTo);
    const signer = await getSigner();
    const chainIdFrom = await signer.provider.provider.send("eth_chainId", []);

    if (!isSupported(chainIdFrom)) {
      throw Error(`chain Id: ${chainIdFrom} is not supported`);
    }

    if (!isSupported(chainIdTo)) {
      throw Error(`chain Id: ${chainIdTo} is not supported`);
    }

    const receiver = await signer.getAddress();

    const message = new evm.Message({
      tokenAddress: "0x0000000000000000000000000000000000000000",
      amount: ethers.utils.parseEther(bridgeAmount).toString(),
      chainIdTo,
      receiver: receiver,
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

const claim = async ({ txHash, chainIdFrom, chainIdTo }) => {
  try {
    if (!isSupported(chainIdFrom)) {
      throw Error(`chain Id: ${chainIdFrom} is not supported`);
    }

    if (!isSupported(chainIdTo)) {
      throw Error(`chain Id: ${chainIdTo} is not supported`);
    }

    const evmOriginContext = {
      provider: rpcNodes[chainIdFrom],
    };

    const submissions = await evm.Submission.findAll(txHash, evmOriginContext);

    if (submissions.length === 0 || submissions.length > 1) {
      throw Error();
    }

    const [submission] = submissions;
    const isConfirmed = await submission.hasRequiredBlockConfirmations();

    if (!isConfirmed) {
      throw Error("Not yet confirmed!");
    }

    const evmDestinationContext = {
      provider: rpcNodes[chainIdTo],
    };

    const claim = await submission.toEVMClaim(evmDestinationContext);

    const isSigned = await claim.isSigned();
    const isExecuted = await claim.isExecuted();

    if (!isSigned) {
      throw Error("Not yet signed!");
    }
    if (isExecuted) {
      storeTxInfo(null, null, null);
      throw Error("Already excuted!");
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
    return `successfully claimed cross-chain Ether: ${tx.hash}`;
  } catch (error) {
    console.error("Error claiming cross-chain Ether:", error);
    return `${FAILED_KEY} to claim cross-chain Ether: ${error.message}`;
  }
};

export { getTxStatus, bridgeService, claim };
