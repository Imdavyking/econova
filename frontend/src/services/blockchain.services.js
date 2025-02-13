/** @format */
import abi from "@/assets/json/abi.json";
import erc20 from "@/assets/json/erc20.json";
import nftCourseAbi from "@/assets/json/course-nft.json";
import iWethAbi from "@/assets/json/iweth.json";
import { BrowserProvider, ethers } from "ethers";
import {
  BMI_ADVICE,
  CHAIN_BLOCKEXPLORER_URL,
  CHAIN_CURRENCY_NAME,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
  CHAIN_SYMBOL,
  CONTRACT_ADDRESS,
  FAILED_KEY,
  FIAT_DECIMALS,
  NFT_COURSE_CONTRACT_ADDRESS,
  WRAPPED_SONIC_COURSE_CONTRACT_ADDRESS,
} from "../utils/constants";
import { getWholeNumber } from "../utils/whole.util";
import { charityCategories } from "../utils/charity.categories";
import { getHealthyBMIProof } from "./zk.bmi.services";

async function switchOrAddChain(ethProvider) {
  try {
    const chainId = await ethProvider.provider.send("eth_chainId", []);
    console.log(`Current chainId: ${Number(chainId)}`);

    if (Number(chainId) !== Number(CHAIN_ID)) {
      try {
        await ethProvider.provider.send("wallet_switchEthereumChain", [
          { chainId: CHAIN_ID },
        ]);
        console.log(`Switched to ${CHAIN_NAME} Testnet`);
      } catch (error) {
        if (error.code === 4902) {
          await ethProvider.provider.send("wallet_addEthereumChain", [
            {
              chainId: CHAIN_ID,
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
          console.log(`${CHAIN_NAME} Testnet added and switched`);
        } else {
          console.error(
            `${FAILED_KEY} to switch to ${CHAIN_NAME} Testnet:`,
            error
          );
        }
      }
    } else {
      console.log(`Already connected to ${CHAIN_NAME} Testnet`);
    }
  } catch (error) {}
}

export const getSigner = async () => {
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

const getIWethContract = async () => {
  if (!window.ethereum) {
    toast.info(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider);
  return new ethers.Contract(
    WRAPPED_SONIC_COURSE_CONTRACT_ADDRESS,
    iWethAbi,
    signer
  );
};

const getERC20Contract = async (address) => {
  if (!window.ethereum) {
    toast.info(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider);
  return new ethers.Contract(address, erc20, signer);
};

const getContract = async () => {
  if (!window.ethereum) {
    toast.info(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider);
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
};

const getNFTCourseContract = async () => {
  if (!window.ethereum) {
    toast.info(
      "MetaMask is not installed. Please install it to use this feature."
    );
    return;
  }
  const signer = await getSigner();

  await switchOrAddChain(signer.provider);
  return new ethers.Contract(NFT_COURSE_CONTRACT_ADDRESS, nftCourseAbi, signer);
};

export const adviceOnHealthService = async ({ advice }) => {
  return advice;
};

export const wrapEthService = async ({ amount }) => {
  try {
    const contract = await getIWethContract();
    const tx = await contract.deposit({
      value: ethers.utils.parseEther(amount.toString()),
    });
    await tx.wait(1);

    return `wrapped ${amount} ${CHAIN_SYMBOL}`;
  } catch (error) {
    return `${FAILED_KEY} to wrap ${amount} ${CHAIN_SYMBOL}`;
  }
};

export const unwrapEthService = async ({ amount }) => {
  try {
    const contract = await getIWethContract();
    const tx = await contract.withdraw(
      ethers.utils.parseEther(amount.toString())
    );
    await tx.wait(1);

    return `unwrapped ${amount} ${CHAIN_SYMBOL}`;
  } catch (error) {
    return `${FAILED_KEY} to unwrap ${amount} ${CHAIN_SYMBOL}`;
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
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount.toString()),
    });
    await tx.wait(1);

    return `sent ${amount} SONIC to ${recipientAddress}`;
  } catch (error) {
    console.log();
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

    const [name, symbol] = await Promise.all([token.name(), token.symbol()]);
    return { name, symbol, tokenAddress };
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
    const signer = await getSigner();
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
  try {
    const manager = await getContract();

    const tx = await manager.addPointsFromTwitterBot(
      getWholeNumber(points).toString(),
      userTwitterId.toString(),
      tweetId.toString(),
      signature.toString(),
      { gasLimit: 500000 }
    );

    await tx.wait(1);
    return `claims ${points} points for tweet ${tweetId}`;
  } catch (error) {
    return `${FAILED_KEY} to claim ${points} points for tweet ${tweetId}`;
  }
};

export const rethrowFailedResponse = (response) => {
  if (String(response).includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
