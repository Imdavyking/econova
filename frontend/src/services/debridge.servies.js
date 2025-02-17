import { evm } from "@debridge-finance/desdk";
import { ethers } from "ethers";
import { getSigner } from "./blockchain.services";
import { DEFAULT_DEBRIDGE_GATE_ADDRESS } from "@debridge-finance/desdk/lib/evm/context";
import { Flags } from "@debridge-finance/desdk/lib/evm";

const debridgeAbi = [
  "function send(address _tokenAddress,uint256 _amount,uint256 _chainIdTo,bytes _receiver,bytes _permitEnvelope,bool _useAssetFee,uint32 _referralCode,bytes _autoParams) external payable returns (bytes32)",
  "function claim(bytes32 _debridgeId,uint256 _amount,uint256 _chainIdFrom,address _receiver,uint256 _nonce,bytes calldata _signatures,bytes calldata _autoParams) external",
  "function globalFixedNativeFee() view returns (uint256)",
];

const rpcNodes = {
  137: "https://polygon-rpc.com/",
  42161: "https://arb1.arbitrum.io/rpc",
};

const isSupported = (chainId) => {
  return (
    Object.keys(rpcNodes).filter(
      (availableChainId) => availableChainId.toString() === chainId.toString()
    ).length > 0
  );
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

export const getTxInfo = () => {
  const content = localStorage.getItem(TX_HASH_LOCAL_STORAGE_KEY);
  if (content) {
    return JSON.parse(localStorage.getItem(TX_HASH_LOCAL_STORAGE_KEY));
  } else {
    return { txHash: null, chainIdFrom: null, chainIdTo: null };
  }
};
export const getTxStatus = async (txHash, chainIdFrom, chainIdTo) => {
  console.log(txHash, chainIdFrom, chainIdTo);

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

async function sendEVMCrossChain({
  receiverAddress,
  amountInEther,
  chainIdTo,
}) {
  try {
    const signer = await getSigner();

    const chainIdFrom = await signer.getChainId();

    if (!isSupported(chainIdFrom)) {
      throw Error(`chain Id: ${chainIdFrom} is not supported`);
    }

    if (!isSupported(chainIdTo)) {
      throw Error(`chain Id: ${chainIdTo} is not supported`);
    }

    const deBridgeGate = new ethers.Contract(
      DEFAULT_DEBRIDGE_GATE_ADDRESS,
      debridgeAbi,
      signer
    );

    const message = new evm.Message({
      tokenAddress: "0x0000000000000000000000000000000000000000",
      amount: ethers.utils.parseEther(amountInEther).toString(),
      chainIdTo,
      receiver: receiverAddress,
      autoParams: new evm.SendAutoParams({
        executionFee: "0",
        fallbackAddress: receiverAddress,
        flags: new Flags(),
        data: "0x",
      }),
    });

    const argsForSend = message.getEncodedArgs();

    const fee = await deBridgeGate.globalFixedNativeFee();
    const etherToSend = fee.add(ethers.utils.parseEther(amountInEther));

    const tx = await deBridgeGate.send(...argsForSend, { value: etherToSend });
    const receipt = await tx.wait();

    storeTxInfo(receipt.transactionHash, chainIdFrom, chainIdTo);

    console.log(`Transaction sent: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("Error sending cross-chain Ether:", error);
    return null;
  }
}

export const claim = async (txHash, chainIdFrom, chainIdTo) => {
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
  return receipt;
};

export {
  getCrossChainTransferDetails,
  sendEVMCrossChain as sendEtherCrossChain,
};

// export const claim = async (txHash, chainIdFrom, chainIdTo) => {
//     const { ethereum } = window;
//     if (!ethereum || !txHash || !chainIdFrom || !chainIdTo) {
//       throw Error();
//     }

//     if (!isSupported(chainIdFrom)) {
//       throw Error(`chain Id: ${chainIdFrom} is not supported`);
//     }

//     if (!isSupported(chainIdTo)) {
//       throw Error(`chain Id: ${chainIdTo} is not supported`);
//     }

//     const evmOriginContext = {
//       provider: rpcNodes[chainIdFrom],
//     };

//     const submissions = await evm.Submission.findAll(txHash, evmOriginContext);
//     console.log(submissions);
//     if (submissions.length === 0 || submissions.length > 1) {
//       throw Error();
//     }

//     const [submission] = submissions;
//     const isConfirmed = await submission.hasRequiredBlockConfirmations();

//     if (!isConfirmed) {
//       throw Error("Not yet confirmed!");
//     }

//     const evmDestinationContext = {
//       provider: rpcNodes[chainIdTo],
//     };

//     const claim = await submission.toEVMClaim(evmDestinationContext);

//     const isSigned = await claim.isSigned();
//     const isExecuted = await claim.isExecuted();

//     if (!isSigned) {
//       throw Error("Not yet signed!");
//     }
//     if (isExecuted) {
//       storeTxInfo(null, null, null);
//       throw Error("Already excuted!");
//     }

//     const provider = new ethers.providers.Web3Provider(ethereum);
//     const signer = provider.getSigner();

//     const claimArgs = await claim.getEncodedArgs();

//     const deBridgeGate = await new ethers.Contract(
//       DEFAULT_DEBRIDGE_GATE_ADDRESS,
//       [
//         "function claim(bytes32 _debridgeId,uint256 _amount,uint256 _chainIdFrom,address _receiver,uint256 _nonce,bytes calldata _signatures,bytes calldata _autoParams) external",
//       ],
//       signer
//     );

//     const tx = await deBridgeGate.claim(...claimArgs);
//     const receipt = await tx.wait();

//     if (receipt.status === 1) {
//       storeTxInfo(null, null, null);
//     }
//     return receipt;
//   };
