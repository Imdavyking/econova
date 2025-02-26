/** @format */
import abi from "@/assets/json/abi.json";
import erc20Abi from "@/assets/json/erc20.json";
import oftAbi from "@/assets/json/oft.json";
import nftCourseAbi from "@/assets/json/course-nft.json";
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
  ETH_ADDRESS,
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

  const debridgeAbi = new ethers.Interface([
    "function send(address _tokenAddress,uint256 _amount,uint256 _chainIdTo,bytes _receiver,bytes _permitEnvelope,bool _useAssetFee,uint32 _referralCode,bytes _autoParams) external payable returns (bytes32)",
    "function claim(bytes32 _debridgeId,uint256 _amount,uint256 _chainIdFrom,address _receiver,uint256 _nonce,bytes calldata _signatures,bytes calldata _autoParams) external",
    "function globalFixedNativeFee() view returns (uint256)",
  ]);

  return new ethers.Contract(
    DEFAULT_DEBRIDGE_GATE_ADDRESS,
    debridgeAbi,
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
    iWrappedSonicAbi,
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
  return new ethers.Contract(MULTICALL3_CONTRACT_ADDRESS, multicallAbi, signer);
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

  return {
    contract: new ethers.Contract(tokenAddress, oftAbi, signer),
    signer: signer,
  };
};

const getERC20Contract = async (address) => {
  if (!window.ethereum) {
    console.log(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider, CHAIN_ID);
  return new ethers.Contract(address, erc20Abi, signer);
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
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
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
  return new ethers.Contract(NFT_COURSE_CONTRACT_ADDRESS, nftCourseAbi, signer);
};

export const getPeerTokenAddress = async ({
  eidB,
  oftTokenAddress,
  sourceChainId,
}) => {
  try {
    const oftInfo = await getOFTContract(oftTokenAddress, sourceChainId);

    const contract = oftInfo.contract;

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
    const oftInfo = await getOFTContract(oftTokenAddress, sourceChainId);

    const contract = oftInfo.contract;

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
      signer: oftInfo.signer,
    };
  } catch (error) {
    console.error("❌ Error calculating send fee:", error);
    throw error;
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
    return `${FAILED_KEY} to wrap ${amount} ${CHAIN_SYMBOL} ${error.message}`;
  }
};

export const unwrapSonicService = async ({ amount }) => {
  try {
    const contract = await getIWSonicContract();
    const tx = await contract.withdraw(ethers.parseEther(amount.toString()));
    await tx.wait(1);

    return `unwrapped ${amount} wrapped ${CHAIN_SYMBOL}`;
  } catch (error) {
    return `${FAILED_KEY} to unwrap ${amount} ${CHAIN_SYMBOL} ${error.message}`;
  }
};

export const saveHealthyBMIProofService = async ({
  weightInKg,
  heightInCm,
}) => {
  try {
    const { proof, publicSignals } = await getHealthyBMIProof({
      weightInKg,
      heightInCm,
    });

    const _pubSignals = publicSignals;

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
    return `${FAILED_KEY} : ${BMI_ADVICE}`;
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
    return `${FAILED_KEY} to donate ${realAmount} USD`;
  }
};

export const getCharityCategoryAddressService = async ({ charityCatogory }) => {
  try {
    const manager = await getContract();
    const charityAddress = await manager.charityOrganizations(charityCatogory);
    return `${charityAddress}`;
  } catch (error) {
    return `${FAILED_KEY} to get ${charityCatogory} address`;
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
    const decimals = await contract.decimals();
    const tx = await contract.transfer(
      recipientAddress,
      getWholeNumber(Number(amount) * 10 ** decimals)
    );
    await tx.wait(1);

    return `sent ${amount} ${tokenAddress} to ${recipientAddress}`;
  } catch (error) {
    return `${FAILED_KEY} to send ${amount} ${tokenAddress} to ${recipientAddress}`;
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
    return `${FAILED_KEY} to deploy ${name} token`;
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

export const getTokenBalance = async (tokenAddress, switchChainId) => {
  try {
    const signer = await getSigner();

    await switchOrAddChain(signer.provider, switchChainId);

    const address = await signer.getAddress();

    if (tokenAddress == ethers.ZeroAddress || tokenAddress == ETH_ADDRESS) {
      const balance = await signer.provider.getBalance(address);
      return { balance, decimals: 18 };
    }

    const token = await getERC20Contract(tokenAddress);

    const [balance, decimals] = await Promise.all([
      token.balanceOf(address),
      token.decimals(),
    ]);
    return { balance, decimals };
  } catch (error) {
    console.log(error);
    throw error;
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

    const [price, exp] = await manager.getPricePyth();
    return [price, exp];
  } catch (error) {
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
    const tx = await signer.provider.getTransaction(txHash);
    const blockInfo = await signer.provider.getBlock(tx.blockNumber);
    const timestamp = new Date(blockInfo.timestamp * 1000).toUTCString();
    const { from, to, nonce, hash, chainId } = tx;
    const value = ethers.formatEther(tx.value);
    const gasPrice = ethers.formatEther(tx.gasPrice);
    const gasLimit = ethers.formatEther(tx.gasLimit);
    const [fromCode, toCode] = await Promise.all([
      from ? signer.provider.getCode(from) : "0x",
      to ? signer.provider.getCode(to) : "0x",
    ]);

    const fromIsContract = fromCode != "0x";
    const toIsContract = toCode != "0x";
    return {
      value,
      gasPrice,
      gasLimit,
      from,
      to,
      nonce,
      hash,
      chainId,
      timestamp,
      nativeTokenSymbol: CHAIN_CURRENCY_NAME,
      nativeToken: CHAIN_NAME,
      fromIsContract,
      toIsContract,
    };
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
    return `${FAILED_KEY} to redeem ${points} points`;
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
    return `${FAILED_KEY} to claim ${
      points * POINT_BASIS
    } points for tweet ${tweetId}`;
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
