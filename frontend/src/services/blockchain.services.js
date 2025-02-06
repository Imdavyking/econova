/** @format */
import abi from "@/assets/json/abi.json";
import { BrowserProvider, ethers } from "ethers";
import {
  CHAIN_BLOCKEXPLORER_URL,
  CHAIN_CURRENCY_NAME,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
  CHAIN_SYMBOL,
  CONTRACT_ADDRESS,
  FAILED_KEY,
  FIAT_DECIMALS,
} from "../utils/constants";
import { getWholeNumber } from "../utils/whole.util";
import { charityCategories } from "../utils/charity.categories";
import { checkBMI } from "./zk.bmi.services";

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
              rpcUrls: [CHAIN_RPC], // Replace with your RPC URL
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
  let objectNetwork = await provider.getNetwork();
  console.log(objectNetwork);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
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

export const checkBMIHealthyService = async ({
  proof: { proof, publicSignals },
}) => {
  const realAmount = amountInUsd;
  try {
    const manager = await getContract();
    const tx = await manager.checkBMIHealthy(proof);

    const receipt = await tx.wait(1);

    const event = receipt.events[1];
    const args = event.args;
    const [_, isHealthy] = args;

    return `BMI is ${isHealthy ? "healthy" : "unhealthy"}`;
  } catch (error) {
    console.log(error);
    return `${FAILED_KEY} to donate ${realAmount} USD`;
  }
};

export const donateToFoundationService = async ({
  category,
  tokenAddress,
  amountInUsd,
}) => {
  const realAmount = amountInUsd;
  try {
    await checkBMI();
    return;
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

export const deployTokenService = async ({ name, symbol, initialSupply }) => {
  try {
    const manager = await getContract();
    const tx = await manager.deployToken(
      name,
      symbol,
      getWholeNumber(initialSupply).toString()
    );
    const receipt = await tx.wait(1);

    const event = receipt.events[1];
    const args = event.args;
    const [tokenAddress] = args;
    return `deployed ${name} token at ${tokenAddress}`;
  } catch (error) {
    return `${FAILED_KEY} to deploy ${name} token`;
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

const errDecoder = async (e) => {
  const manager = await getContract();
  if (e.data && contract) {
    const decodedError = manager.interface.parseError(e.data);
    return `Transaction failed: ${decodedError?.name}`;
  } else {
    return e;
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
    console.log(JSON.stringify(error));
    return `${FAILED_KEY} to claim ${points} points for tweet ${tweetId}`;
  }
};

export const rethrowFailedResponse = (response) => {
  if (String(response).includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
