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

export const saveHealthyBMIProofService = async ({
  weightInKg,
  heightInCm,
}) => {
  const BMI_UNHEALTHY =
    "BMI is likely to be unhealthy, we will suggest you how to improve your BMI";
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

    console.log({ _pA, _pB, _pC, _pubSignals });
    const tx = await manager.checkBMIHealthy(
      [
        "20606638541072922061980428880724412480908269290138854078750983266247270498397",
        "4672451083534101101597832021484554888189901911089965552618285519770622790931",
      ],
      [
        [
          "16591371836046369082101798809051895293297518014895540262919917525466208670575",
          "4297016560857544825984867378256335957562038908290277969518564658450810758958",
        ],
        [
          "877062026622333165730181566302122034682188148884094488712779314966298240515",
          "10035002646655856374128822531335377239491785149066640510768304671780887993830",
        ],
      ],
      [
        "3816844612412909560289070152002134674862700669878787340781696546457876357565",
        "5942731572393451414117325646745711737508576984550362617110023419428425319555",
      ],
      ["1", "1"]
    );
    const receipt = await tx.wait(1);

    // const event = receipt.events[1];
    // const args = event.args;
    // const [user, isHealthy] = args;

    // console.log({ user, isHealthy });

    const signer = await getSigner();

    const userHealthy = await manager.userBMIHealthy(await signer.getAddress());

    console.log({ userHealthy });

    if (!userHealthy) {
      throw new Error(BMI_UNHEALTHY);
    }

    return `BMI is healthy, keep up the good work`;
  } catch (error) {
    console.log(error);
    if (typeof error === "string") {
      return error;
    } else {
      return `${FAILED_KEY} to save BMI proof`;
    }
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
    return `${FAILED_KEY} to claim ${points} points for tweet ${tweetId}`;
  }
};

export const rethrowFailedResponse = (response) => {
  if (String(response).includes(FAILED_KEY)) {
    throw new Error(response);
  }
  return response;
};
