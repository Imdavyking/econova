import { evm } from "@debridge-finance/desdk";
import { ethers } from "ethers";
import { getSigner } from "./blockchain.services";
import { DEFAULT_DEBRIDGE_GATE_ADDRESS } from "@debridge-finance/desdk/lib/evm/context";

async function getCrossChainTransferDetails(transactionHash, providerUrl) {
  try {
    const evmOriginContext = { provider: providerUrl };

    const submissions = await evm.Submission.findAll(
      transactionHash,
      evmOriginContext
    );

    if (!submissions.length) {
      console.log("No submissions found for the given transaction hash.");
      return null;
    }

    const [submission] = submissions;
    const isConfirmed = await submission.hasRequiredBlockConfirmations();

    if (!isConfirmed) {
      console.log("Transaction is not yet confirmed.");
      return null;
    }

    console.log("Cross-chain asset ID transferred:", submission.debridgeId);
    console.log(
      "Amount transferred to",
      submission.receiver,
      ":",
      submission.amount
    );

    return {
      debridgeId: submission.debridgeId,
      receiver: submission.receiver,
      amount: submission.amount,
      isConfirmed,
    };
  } catch (error) {
    console.error("Error fetching cross-chain transfer details:", error);
    return null;
  }
}

async function sendEtherCrossChain(receiverAddress, amountInEther, chainIdTo) {
  try {
    const signer = await getSigner();

    const deBridgeGate = new ethers.Contract(
      DEFAULT_DEBRIDGE_GATE_ADDRESS,
      [
        "function send(address _tokenAddress,uint256 _amount,uint256 _chainIdTo,bytes _receiver,bytes _permitEnvelope,bool _useAssetFee,uint32 _referralCode,bytes _autoParams) external payable returns (bytes32)",
        "function claim(bytes32 _debridgeId,uint256 _amount,uint256 _chainIdFrom,address _receiver,uint256 _nonce,bytes calldata _signatures,bytes calldata _autoParams) external",
        "function globalFixedNativeFee() view returns (uint256)",
      ],
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
    await tx.wait();

    console.log(`Transaction sent: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("Error sending cross-chain Ether:", error);
    return null;
  }
}

export { getCrossChainTransferDetails, sendEtherCrossChain };

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
