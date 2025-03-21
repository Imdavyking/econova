/** @format */
import managerAbi from "@/assets/json/abi.json";
import erc20Abi from "@/assets/json/erc20.json";
import governorAbi from "@/assets/json/governor.json";
import oftAbi from "@/assets/json/oft.json";
import nftCourseAbi from "@/assets/json/course-nft.json";
import charityAbi from "@/assets/json/charity.json";
import iWrappedSonicAbi from "@/assets/json/iwrapped-sonic.json";
import multicallAbi from "@/assets/json/multicall3.json";
import { BrowserProvider, ethers } from "ethers";
import { DEFAULT_DEBRIDGE_GATE_ADDRESS } from "@debridge-finance/desdk/lib/evm/context";
import {
  BMI_ADVICE,
  CHAIN_BLOCKEXPLORER_URL,
  CHAIN_CURRENCY_NAME,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
  CHAIN_SYMBOL,
  CONTRACT_ADDRESS,
  ECONOVA_GOVERNOR_CONTRACT_ADDRESS,
  NATIVE_TOKEN,
  FAILED_KEY,
  FIAT_DECIMALS,
  MULTICALL3_CONTRACT_ADDRESS,
  NFT_COURSE_CONTRACT_ADDRESS,
  WRAPPED_SONIC_CONTRACT_ADDRESS,
} from "../utils/constants";
import { getWholeNumber } from "../utils/whole.util";
import { charityCategories } from "../utils/charity.categories";
import { getHealthyBMIProof } from "./zk.bmi.services";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { getVerifiedSourceCode } from "./source.code.services";
import Kyberswap from "./kyber.swap.services";

const governorAbiInterface = new ethers.Interface(governorAbi);
const nftCourseAbiInterface = new ethers.Interface(nftCourseAbi);
const oftAbiInterface = new ethers.Interface(oftAbi);
export const erc20AbiInterface = new ethers.Interface(erc20Abi);
const managerAbiInterface = new ethers.Interface(managerAbi);
const iWrappedSonicAbiInterface = new ethers.Interface(iWrappedSonicAbi);
const multicallAbiInterface = new ethers.Interface(multicallAbi);
export const charityAbiInterface = new ethers.Interface(charityAbi);
const debridgeAbiInterface = new ethers.Interface([
  "function send(address _tokenAddress,uint256 _amount,uint256 _chainIdTo,bytes _receiver,bytes _permitEnvelope,bool _useAssetFee,uint32 _referralCode,bytes _autoParams) external payable returns (bytes32)",
  "function claim(bytes32 _debridgeId,uint256 _amount,uint256 _chainIdFrom,address _receiver,uint256 _nonce,bytes calldata _signatures,bytes calldata _autoParams) external",
  "function globalFixedNativeFee() view returns (uint256)",
]);

async function switchOrAddChain(ethProvider, switchChainId) {
  try {
    const currentChainId = Number(
      await ethProvider.provider.send("eth_chainId", [])
    );
    const targetChainId = Number(switchChainId);
    const chainIdHex = `0x${targetChainId.toString(16)}`;

    console.log(
      `Current chainId: ${currentChainId}, Switch chainId: ${targetChainId}`
    );

    if (currentChainId === targetChainId) {
      console.log(`Already connected to ${targetChainId}`);
      return;
    }

    try {
      await ethProvider.provider.send("wallet_switchEthereumChain", [
        { chainId: chainIdHex },
      ]);
      console.log(`Switched to ${targetChainId}`);
    } catch (error) {
      console.error(`Error switching chain:`, error);

      if (error.code === 4902) {
        console.log(`Chain ${targetChainId} not found. Attempting to add.`);

        if (targetChainId === Number(CHAIN_ID)) {
          await ethProvider.provider.send("wallet_addEthereumChain", [
            {
              chainId: chainIdHex,
              chainName: CHAIN_NAME,
              nativeCurrency: {
                name: CHAIN_CURRENCY_NAME,
                symbol: CHAIN_SYMBOL,
                decimals: 18,
              },
              rpcUrls: [CHAIN_RPC],
              blockExplorerUrls: [CHAIN_BLOCKEXPLORER_URL],
            },
          ]);
          console.log(`${CHAIN_NAME} added and switched`);
        }
      } else {
        console.error(`Failed to switch to ${targetChainId}:`, error);
      }
    }
  } catch (error) {
    console.error(`Unexpected error in switchOrAddChain:`, error);
  }
}
export const getBlockNumber = async () => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const blockNumber = await provider.getBlockNumber();
    return blockNumber;
  } catch (error) {
    console.error("Error getting block number:", error);
    throw error;
  }
};
function parseContractError(error, contractInterface) {
  if (!error?.data || !contractInterface) return null;

  try {
    const errorFragment = contractInterface.fragments.find(
      (fragment) =>
        fragment.type === "error" && error.data.startsWith(fragment.selector)
    );

    return errorFragment ? contractInterface.parseError(error.data) : null;
  } catch (err) {
    console.error("Error parsing contract error:", err);
    return null;
  }
}

export const getSigner = async () => {
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

export const getBridgeContract = async (chainIdFrom) => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }

  const signer = await getSigner();

  await switchOrAddChain(signer.provider, chainIdFrom);

  return new ethers.Contract(
    DEFAULT_DEBRIDGE_GATE_ADDRESS,
    debridgeAbiInterface,
    signer
  );
};

const getIWSonicContract = async () => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, CHAIN_ID);
  return new ethers.Contract(
    WRAPPED_SONIC_CONTRACT_ADDRESS,
    iWrappedSonicAbiInterface,
    signer
  );
};

const getMulticall3Contract = async () => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, CHAIN_ID);
  return new ethers.Contract(
    MULTICALL3_CONTRACT_ADDRESS,
    multicallAbiInterface,
    signer
  );
};

const getOFTContract = async (tokenAddress, sourceChainId) => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, sourceChainId);

  return new ethers.Contract(tokenAddress, oftAbiInterface, signer);
};

export const getERC20Contract = async (address, chainId = CHAIN_ID) => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, chainId);
  return new ethers.Contract(address, erc20AbiInterface, signer);
};

const getContract = async () => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, CHAIN_ID);
  return new ethers.Contract(CONTRACT_ADDRESS, managerAbiInterface, signer);
};

const getNFTCourseContract = async () => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, CHAIN_ID);
  return new ethers.Contract(
    NFT_COURSE_CONTRACT_ADDRESS,
    nftCourseAbiInterface,
    signer
  );
};

const getGovernorContract = async () => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, CHAIN_ID);
  return new ethers.Contract(
    ECONOVA_GOVERNOR_CONTRACT_ADDRESS,
    governorAbiInterface,
    signer
  );
};

export const getPeerTokenAddress = async ({
  eidB,
  oftTokenAddress,
  sourceChainId,
}) => {
  try {
    const contract = await getOFTContract(oftTokenAddress, sourceChainId);

    const peers = await contract.peers(eidB);

    return peers;
  } catch (error) {
    console.error("❌ Error getting peer token address:", error);
    throw error;
  }
};

export async function getOFTSendFee({
  oftTokenAddress,
  recipientAddress,
  eidB,
  tokensToSend,
  sourceChainId,
}) {
  try {
    const contract = await getOFTContract(oftTokenAddress, sourceChainId);
    const signer = await getSigner();

    const options = Options.newOptions()
      .addExecutorLzReceiveOption(200000, 0)
      .toHex()
      .toString();

    const sendParam = [
      eidB,
      ethers.zeroPadValue(recipientAddress, 32),
      tokensToSend,
      tokensToSend,
      options,
      "0x",
      "0x",
    ];

    const [nativeFee, lzTokenFee] = await contract.quoteSend(sendParam, false);

    return {
      nativeFee,
      sendParam,
      lzTokenFee,
      contract,
      signer,
    };
  } catch (error) {
    console.error("❌ Error calculating send fee:", error);
    throw error;
  }
}

export async function daoDelegate({ tokenAddress }) {
  try {
    const contract = await getERC20Contract(tokenAddress);
    const signer = await getSigner();

    const currentVotes = await contract.getVotes(signer.address);
    const tokenBalance = await contract.balanceOf(signer.address);

    if (currentVotes <= 0 && tokenBalance > 0) {
      const tx = await contract.delegate(signer.address);
      await tx.wait(1);
    }

    return `delegated governance of ${tokenAddress} to ${signer.address}`;
  } catch (error) {
    const errorInfo = parseContractError(error, erc20AbiInterface);
    console.log("❌ Error during delegation:", error);
    return `${FAILED_KEY} to delegate governance of ${tokenAddress}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function daoPropose({
  targetAddress,
  encodedFunctionCall,
  PROPOSAL_DESCRIPTION,
}) {
  try {
    const governor = await getGovernorContract();
    const tx = await governor.propose(
      [targetAddress],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION
    );
    await tx.wait(1);
    return `proposed ${PROPOSAL_DESCRIPTION}`;
  } catch (error) {
    const errorInfo = parseContractError(error, governorAbiInterface);

    return `${FAILED_KEY} to propose: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function daoUserHasVoted({ proposalId }) {
  try {
    const signer = await getSigner();
    const governor = await getGovernorContract();
    const userAddress = await signer.getAddress();
    const [hasVoted, support] = await governor.getReceipt(
      proposalId,
      userAddress
    );
    return { hasVoted, support };
  } catch (error) {
    console.log({ check: error });
    return false;
  }
}

export async function daoVote({ proposalId, voteWay, reason = "" }) {
  try {
    const governor = await getGovernorContract();
    const tx = await governor.castVoteWithReason(proposalId, voteWay, reason);
    await tx.wait(1);
    return `voted ${voteWay} on proposal ${proposalId}`;
  } catch (error) {
    const errorInfo = parseContractError(error, governorAbiInterface);

    return `${FAILED_KEY} to vote ${voteWay} on proposal ${proposalId}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function daoCancel({ targets, calldatas, description }) {
  try {
    const governor = await getGovernorContract();
    const tx = await governor.cancel(
      targets,
      [0],
      calldatas,
      ethers.id(description)
    );
    await tx.wait(1);
    return `cancelled proposal ${description}`;
  } catch (error) {
    const errorInfo = parseContractError(error, governorAbiInterface);

    return `${FAILED_KEY} to cancel proposal: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function daoQueue({ targets, calldatas, description }) {
  try {
    const governor = await getGovernorContract();
    const tx = await governor.queue(
      targets,
      [0],
      calldatas,
      ethers.id(description)
    );
    await tx.wait(1);
    return `queued proposal ${description}`;
  } catch (error) {
    const errorInfo = parseContractError(error, governorAbiInterface);

    return `${FAILED_KEY} to queue proposal: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function daoExecute({ targets, calldatas, description }) {
  try {
    const governor = await getGovernorContract();

    const tx = await governor.execute(
      targets,
      [0],
      calldatas,
      ethers.id(description)
    );
    await tx.wait(1);
    return `executed proposal ${description}`;
  } catch (error) {
    let errorInfo = parseContractError(error, governorAbiInterface);

    if (!errorInfo) {
      errorInfo = parseContractError(error, charityAbiInterface);
    }

    return `${FAILED_KEY} to execute proposal: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function daoProposalState({ proposalId }) {
  try {
    const governor = await getGovernorContract();
    const state = await governor.state(proposalId);
    return state;
  } catch (error) {
    const errorInfo = parseContractError(error, governorAbiInterface);

    return `${FAILED_KEY} to get state on proposal ${proposalId}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
}

export async function sendOFTTokens({
  oftTokenAddress,
  recipientAddress,
  eidB,
  tokensToSend,
}) {
  try {
    const { nativeFee, lzTokenFee, sendParam, contract, signer } =
      await getOFTSendFee({
        oftTokenAddress,
        recipientAddress,
        eidB,
        tokensToSend,
      });

    const tx = await contract.send(
      sendParam,
      [nativeFee, lzTokenFee],
      await signer.getAddress(),
      {
        value: nativeFee,
      }
    );
    await tx.wait(1);
    return `sent ${tokensToSend} ${oftTokenAddress} to ${recipientAddress}`;
  } catch (error) {
    console.error("❌ Error during token transfer:", error);
    throw error;
  }
}

export const adviceOnHealthService = async ({ advice }) => {
  return advice;
};

export const wrapSonicService = async ({ amount }) => {
  try {
    const contract = await getIWSonicContract();

    const tx = await contract.deposit({
      value: ethers.parseEther(amount.toString()),
    });
    await tx.wait(1);

    return `wrapped ${amount} ${CHAIN_SYMBOL}`;
  } catch (error) {
    const errorInfo = parseContractError(error, iWrappedSonicAbiInterface);
    return `${FAILED_KEY} to wrap ${amount} ${CHAIN_SYMBOL} ${error.message}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const swapTokenService = async ({
  sourceToken,
  destToken,
  sourceAmount,
}) => {
  const kyberswap = new Kyberswap(CHAIN_ID);
  try {
    await kyberswap.swap({
      sourceToken,
      destToken,
      sourceAmount,
    });
    return `swapped ${sourceAmount} ${sourceToken} to ${destToken}`;
  } catch (error) {
    return `${FAILED_KEY} to swap tokens: ${error.message}`;
  }
};
export const unwrapSonicService = async ({ amount }) => {
  try {
    const contract = await getIWSonicContract();
    const tx = await contract.withdraw(ethers.parseEther(amount.toString()));
    await tx.wait(1);

    return `unwrapped ${amount} wrapped ${CHAIN_SYMBOL}`;
  } catch (error) {
    const errorInfo = parseContractError(error, iWrappedSonicAbiInterface);
    return `${FAILED_KEY} to unwrap ${amount} ${CHAIN_SYMBOL} ${
      error.message
    }: ${errorInfo ? errorInfo.name : error.message}`;
  }
};

export const saveHealthyBMIProofService = async ({
  weightInKg,
  heightInCm,
}) => {
  try {
    const { proof, _pubSignals } = await getHealthyBMIProof({
      weightInKg,
      heightInCm,
    });

    const _pA = [proof.pi_a[0], proof.pi_a[1]];
    const _pB = [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ];
    const _pC = [proof.pi_c[0], proof.pi_c[1]];
    const manager = await getContract();

    const tx = await manager.checkBMIHealthy(_pA, _pB, _pC, _pubSignals);
    const receipt = await tx.wait(1);

    const logs = manager.interface.parseLog(receipt.logs[0]);

    const userHealthy = logs.args.at(1);

    if (!userHealthy) {
      throw new Error("User not healthy");
    }

    return `BMI is healthy, keep up the good work`;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    const errorInfo = parseContractError(error, managerAbiInterface);
    return `${FAILED_KEY} : ${BMI_ADVICE}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const donateToFoundationService = async ({
  category,
  tokenAddress,
  amountInUsd,
}) => {
  const realAmount = amountInUsd;
  try {
    const usdWithDecimals = getWholeNumber(
      Number(amountInUsd) * 10 ** FIAT_DECIMALS
    ).toString();

    const manager = await getContract();

    const ethAmountToDonate = await manager.getUsdToTokenPrice(
      tokenAddress,
      usdWithDecimals
    );

    const tx = await manager.donateToFoundation(
      category,
      tokenAddress,
      usdWithDecimals,
      {
        gasLimit: 500000,
        value: ethAmountToDonate.toString(),
      }
    );
    await tx.wait(1);

    return `donated ${realAmount} USD to ${Object.keys(charityCategories).find(
      (categoryKey) => `${charityCategories[categoryKey]}` === `${category}`
    )}`;
  } catch (error) {
    console.log(error);
    const errorInfo = parseContractError(error, managerAbiInterface);
    return `${FAILED_KEY} to donate ${realAmount} USD : ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const getAllCharities = async () => {
  try {
    const manager = await getContract();
    const charityLength = await manager.charityLength();
    const length = Number(charityLength);
    const queries = [];

    for (let i = 0; i < length; i++) {
      queries.push({
        target: CONTRACT_ADDRESS,
        callData: managerAbiInterface.encodeFunctionData(
          "charityOrganizations",
          [i]
        ),
      });
    }

    const results = await batchMulticall(queries);

    const charities = results.map(({ success, returnData }) =>
      success
        ? managerAbiInterface.decodeFunctionResult(
            "charityOrganizations",
            returnData
          )[0]
        : "0x00"
    );

    return charities;
  } catch (error) {
    console.log(error);
    const errorInfo = parseContractError(error, managerAbiInterface);
    return `${FAILED_KEY} to get addresses: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const sendSonicService = async ({ recipientAddress, amount }) => {
  try {
    const signer = await getSigner();
    await switchOrAddChain(signer.provider, CHAIN_ID);
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
    });
    await tx.wait(1);

    return `sent ${amount} SONIC to ${recipientAddress}`;
  } catch (error) {
    return `${FAILED_KEY} to send ${amount} SONIC to ${recipientAddress}`;
  }
};

export const sendERC20TokenService = async ({
  tokenAddress,
  recipientAddress,
  amount,
}) => {
  try {
    const contract = await getERC20Contract(tokenAddress);

    const [decimals, name] = await Promise.all([
      contract.decimals(),
      contract.name(),
    ]);

    const tx = await contract.transfer(
      recipientAddress,
      getWholeNumber(Number(amount) * 10 ** Number(decimals))
    );
    await tx.wait(1);

    return `sent ${amount} ${
      name ? name : tokenAddress
    } to ${recipientAddress}`;
  } catch (error) {
    const errorInfo = parseContractError(error, erc20AbiInterface);
    return `${FAILED_KEY} to send ${amount} ${tokenAddress} to ${recipientAddress}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const deployTokenService = async ({ name, symbol, initialSupply }) => {
  try {
    const manager = await getContract();
    const tx = await manager.deployToken(
      name,
      symbol,
      getWholeNumber(initialSupply).toString()
    );
    const receipt = await tx.wait(1);

    const logs = manager.interface.parseLog(receipt.logs[1]);
    const tokenAddress = logs.args.at(0);
    return `deployed ${name} token at ${tokenAddress}`;
  } catch (error) {
    const errorInfo = parseContractError(error, managerAbiInterface);
    return `${FAILED_KEY} to deploy ${name} token: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const getProjectTokenDetails = async () => {
  try {
    const manager = await getContract();

    const tokenAddress = await manager.i_ecoNovaToken();

    const token = await getERC20Contract(tokenAddress);

    const [name, symbol, decimals] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
    ]);
    return { name, symbol, tokenAddress, decimals };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWalletAddressService = async () => {
  try {
    const signer = await getSigner();
    return signer.address;
  } catch (error) {
    return `${FAILED_KEY} to get wallet address`;
  }
};

export const getTokenBalance = async ({
  tokenAddress,
  switchChainId = CHAIN_ID,
}) => {
  try {
    const signer = await getSigner();

    await switchOrAddChain(signer.provider, switchChainId);

    const address = await signer.getAddress();

    if (tokenAddress == ethers.ZeroAddress || tokenAddress == NATIVE_TOKEN) {
      const balance = await signer.provider.getBalance(address);
      return { balance, decimals: 18, name: CHAIN_CURRENCY_NAME };
    }

    const token = await getERC20Contract(tokenAddress, switchChainId);

    const [balance, decimals, name] = await Promise.all([
      token.balanceOf(address),
      token.decimals(),
      token.name(),
    ]);
    return { balance, decimals, name };
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const getTokenBalanceService = async ({
  tokenAddress,
  switchChainId = CHAIN_ID,
}) => {
  let tokenName;
  try {
    const { balance, decimals, name } = await getTokenBalance({
      tokenAddress,
      switchChainId,
    });
    tokenName = name;
    return `${Number(balance) / 10 ** Number(decimals)} ${name}`;
  } catch (error) {
    return `${FAILED_KEY} to get ${tokenName} balance`;
  }
};

export const getPointsService = async () => {
  try {
    const signer = await getSigner();
    const manager = await getContract();

    const userAddress = await signer.getAddress();

    const points = await manager.userPoints(userAddress);
    return Number(points[0]);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPythPriceFeed = async () => {
  try {
    const manager = await getContract();

    const [price, exp] = await manager.getPricePyth(NATIVE_TOKEN);
    return [price, exp];
  } catch (error) {
    const _ = parseContractError(error, managerAbiInterface);
    console.log(error);
    throw error;
  }
};

export const getUserClaimedNFT = async ({ level }) => {
  try {
    const manager = await getNFTCourseContract();
    const signer = await getSigner();

    const userAddress = await signer.getAddress();

    const hasClaimed = await manager.hasClaimedNFT(userAddress, level);
    return hasClaimed;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserNFT = async ({ level }) => {
  try {
    const manager = await getNFTCourseContract();
    const signer = await getSigner();

    const userAddress = await signer.getAddress();

    const tokenURIs = await manager.userTokenURIs(userAddress, level);
    return tokenURIs;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const updateRoot = async ({ level, root, timestamp, signature }) => {
  try {
    const manager = await getNFTCourseContract();

    const tx = await manager.updateRoot(level, root, timestamp, signature, {
      gasLimit: 500000,
    });
    await tx.wait(1);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const updateRootAndClaim = async ({
  level,
  root,
  timestamp,
  signature,
  proof,
  tokenURI,
}) => {
  try {
    const manager = await getNFTCourseContract();
    const tx = await manager.updateRootAndClaim(
      level,
      root,
      timestamp,
      signature,
      proof,
      tokenURI,
      {
        gasLimit: 500000,
      }
    );
    await tx.wait(1);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const claimNFT = async ({ level, proof, tokenURI }) => {
  try {
    const manager = await getNFTCourseContract();

    const tx = await manager.claimNFT(level, proof, tokenURI, {
      gasLimit: 500000,
    });
    await tx.wait(1);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTransactionInfo = async ({ txHash }) => {
  try {
    const signer = await getSigner();

    await switchOrAddChain(signer.provider, CHAIN_ID);
    console.log(`Fetching transaction info for ${txHash}`);
    const tx = await signer.provider.getTransactionReceipt(txHash);
    const txInfo = await tx.getTransaction();
    const blockInfo = await signer.provider.getBlock(tx.blockNumber);
    const timestamp = new Date(blockInfo.timestamp * 1000).toUTCString();
    const { from, to, hash, contractAddress } = tx;

    const value = ethers.formatEther(txInfo.value ?? 0);
    const gasPrice = ethers.formatEther(tx.gasPrice ?? 0);
    const gasLimit = ethers.formatEther(txInfo.gasLimit ?? 0);

    const isContractCreation = to === null;

    const [fromCode, toCode] = await Promise.all([
      from ? signer.provider.getCode(from) : "0x",
      to ? signer.provider.getCode(to) : "0x",
    ]);

    const fromIsContract = fromCode != "0x";
    const toIsContract = toCode != "0x";

    const decodedResult = {
      name: "",
      isValid: false,
      inputs: [],
      params: [],
    };

    if (toIsContract) {
      try {
        const contractCode = await getVerifiedSourceCode({
          contractAddress: to,
        });
        const abiDecoder = new ethers.Interface(
          typeof contractCode.abi === "string"
            ? JSON.parse(contractCode.abi)
            : contractCode.abi
        );

        abiDecoder.fragments.find((fragment) => {
          if (
            fragment.type !== "function" ||
            !txInfo.data.startsWith(fragment.selector)
          )
            return false;

          try {
            const result = abiDecoder.decodeFunctionData(fragment, txInfo.data);
            Object.assign(decodedResult, {
              name: fragment.name,
              inputs: fragment.inputs,
              params: [...result],
              isValid: true,
            });

            return true;
          } catch {
            return false;
          }
        });
      } catch (_) {
        console.log(_);
      }
    }
    const decodedData = {
      value,
      gasPrice,
      gasLimit,
      from,
      to,
      hash,
      data: txInfo.data,
      contractAddress,
      timestamp,
      nativeTokenSymbol: CHAIN_CURRENCY_NAME,
      nativeToken: CHAIN_NAME,
      fromIsContract,
      toIsContract,
      isContractCreation,
    };

    if (decodedResult.isValid) {
      decodedData.decodedResult = decodedResult;
    }

    return decodedData;
  } catch (error) {
    throw error;
  }
};

export const redeemPointsService = async ({ points }) => {
  try {
    const manager = await getContract();
    const tx = await manager.redeemPoints(getWholeNumber(points).toString());
    await tx.wait(1);
    return `redeemed ${points} points`;
  } catch (error) {
    const errorInfo = parseContractError(error, managerAbiInterface);
    return `${FAILED_KEY} to redeem ${points} points: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export const checkForClaimService = async ({ userTwitterId, tweetId }) => {
  try {
    const manager = await getContract();
    const claim = await manager.userAddedTweets(userTwitterId, tweetId);
    return claim;
  } catch (error) {
    return false;
  }
};

export const addPointsFromTwitterService = async ({
  points,
  userTwitterId,
  tweetId,
  signature,
}) => {
  let POINT_BASIS = 0;
  try {
    const manager = await getContract();

    const pointMultiplier = await manager.POINT_BASIS();

    POINT_BASIS = Number(pointMultiplier);

    const tx = await manager.addPointsFromTwitterBot(
      getWholeNumber(points).toString(),
      userTwitterId.toString(),
      tweetId.toString(),
      signature.toString(),
      { gasLimit: 500000 }
    );

    await tx.wait(1);
    return `claimed ${points * POINT_BASIS} points for tweet ${tweetId}`;
  } catch (error) {
    console.log(error.message);
    const errorInfo = parseContractError(error, managerAbiInterface);
    return `${FAILED_KEY} to claim ${
      points * POINT_BASIS
    } points for tweet ${tweetId}: ${
      errorInfo ? errorInfo.name : error.message
    }`;
  }
};

export async function addTokenToMetaMask() {
  try {
    const manager = await getContract();
    const signer = await getSigner();
    const ethProvider = signer.provider;
    const address = await manager.i_ecoNovaToken();
    const token = await getERC20Contract(address);
    const [symbol, decimals] = await Promise.all([
      token.symbol(),
      token.decimals(),
    ]);

    const wasAdded = await ethProvider.provider.send("wallet_watchAsset", {
      type: "ERC20",
      options: {
        address,
        symbol,
        decimals: Number(decimals),
        image: `${window.location.origin}/logo.png`,
      },
    });

    return wasAdded;
  } catch (error) {
    console.error("Error adding token to MetaMask:", error);
    return false;
  }
}

export const batchMulticall = async (queries) => {
  try {
    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error("Invalid queries array");
    }

    const multicall3 = await getMulticall3Contract();

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

export const rethrowFailedResponse = (response) => {
  if (String(response).includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
