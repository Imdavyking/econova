/** @format */
import abi from "@/assets/json/abi.json";
import { ethers } from "ethers";
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

async function switchOrAddChain(ethProvider) {
  try {
    const chainId = await ethProvider.provider.request({
      method: "eth_chainId",
    });
    if (Number(chainId) !== Number(CHAIN_ID)) {
      try {
        await ethProvider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID }],
        });
        console.log(`Switched to ${CHAIN_NAME} Testnet`);
      } catch (error) {
        if (error.code === 4902) {
          await ethProvider.provider.request({
            method: "wallet_addEthereumChain",
            params: [
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
            ],
          });
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

const getSigner = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
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

export const addPointService = async (weight) => {
  try {
    const manager = await getContract();
    const tx = await manager.addPointFromWeight(Math.trunc(weight));
    await tx.wait(1);
    return `added ${weight} points`;
  } catch (error) {
    return `${FAILED_KEY} to add ${weight} points`;
  }
};

export const donateToFoundationService = async ({
  tokenAddress,
  amountInUsd,
}) => {
  const realAmount = amountInUsd;
  try {
    amountInUsd = Math.trunc(Number(amountInUsd) * 10 ** FIAT_DECIMALS);
    const manager = await getContract();
    const ethAmountToDonate = await manager.getUsdToTokenPrice(
      tokenAddress,
      amountInUsd
    );

    const tx = await manager.donateToFoundation(tokenAddress, amountInUsd, {
      value: ethAmountToDonate,
    });
    await tx.wait(1);
    return `donated ${realAmount} USD`;
  } catch (error) {
    return `${FAILED_KEY} to donate ${realAmount} USD`;
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

export const redeemCodeService = async (point) => {
  try {
    const manager = await getContract();
    const tx = await manager.redeemCode(Math.trunc(point));
    await tx.wait(1);
    return `redeemed ${point} points`;
  } catch (error) {
    return `${FAILED_KEY} to redeem ${point} points`;
  }
};

export const rethrowFailedResponse = (response) => {
  if (String(response).includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
