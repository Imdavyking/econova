import { ethers } from "ethers";
import { getERC20Contract, getSigner } from "./blockchain.services";
import { ETH_ADDRESS } from "../utils/constants";

export const KYBERSWAP_AGGREGATOR_API_URL =
  "https://aggregator-api.kyberswap.com/sonic/api/v1";

export const KYBERSWAP_TOKENS_INFO = {
  BEETS: {
    symbol: "BEETS",
    name: "Beets",
    address: "0x2D0E0814E62D80056181F5cd932274405966e4f0",
    decimals: 18,
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether on Sonic",
    address: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
    decimals: 18,
  },
  S: {
    symbol: "S",
    name: "Sonic",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
  },
  SWPx: {
    address: "0xA04BC7140c26fc9BB1F36B1A604C7A5a88fb0E70",
    decimals: 18,
    symbol: "SWPx",
    name: "SWPx",
  },
  wS: {
    address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
    decimals: 18,
    symbol: "wS",
    name: "Wrapped Sonic",
  },
  USDC: {
    address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    decimals: 6,
    symbol: "USDC.e",
    name: "USDC.e",
  },
};

class Kyberswap {
  constructor(chainId) {
    this.chainId = chainId;
  }

  swap = async ({ sourceToken, destToken, sourceAmount, slippage = 0.5 }) => {
    const signer = await getSigner();
    const isNativeToken =
      sourceToken.toLowerCase() ===
      KYBERSWAP_TOKENS_INFO.S.address.toLowerCase();
    let amountRaw;

    if (isNativeToken) {
      amountRaw = ethers.parseEther(sourceAmount.toString());
    } else {
      const tokenContract = await getERC20Contract(sourceToken, this.chainId);

      const decimals = await tokenContract.decimals();
      amountRaw = ethers.parseUnits(
        sourceAmount.toString(),
        decimals.toString()
      );

      const balance = await tokenContract.balanceOf(signer.address);
      if (balance < amountRaw) {
        throw new Error("Insufficient balance");
      }

      await this.handleTokenApproval(sourceToken, routerAddress, amountRaw);
    }

    const routeData = await this.getSwapRoute(
      sourceToken,
      destToken,
      amountRaw
    );

    const routerAddress = routeData.routerAddress;

    const encodedData = await this.getEncodedSwapData(
      routeData.routeSummary,
      slippage
    );

    const tx = {
      from: signer.address,
      to: routeData.routerAddress,
      data: encodedData,
      value: isNativeToken ? amountRaw : 0,
      nonce: await signer.getNonce(),
      chainId: this.chainId,
    };

    try {
      tx.gasLimit = await signer.estimateGas(tx);
    } catch (error) {
      console.warn(`Gas estimation failed: ${error}, using default gas limit`);
      tx.gasLimit = 500000;
    }

    const sentTx = await signer.sendTransaction(tx);
    sentTx.wait(1);

    return sentTx;
  };

  getSwapRoute = async (sourceToken, destToken, amount) => {
    try {
      const url = `${KYBERSWAP_AGGREGATOR_API_URL}/routes`;
      const params = new URLSearchParams({
        tokenIn: sourceToken,
        tokenOut: destToken,
        amountIn: amount.toString(),
        gasInclude: "true",
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        headers: { "x-client-id": "EconovaBot" },
      });

      if (!response.ok) {
        throw new Error(`Failed to get swap route: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(`API error: ${data.message}`);
      }

      return data.data;
    } catch (error) {
      console.error(`Failed to get swap route: ${error}`);
      throw error;
    }
  };

  handleTokenApproval = async (tokenAddress, spenderAddress, amount) => {
    try {
      const signer = await getSigner();
      const tokenContract = await getERC20Contract(tokenAddress, this.chainId);

      const currentAllowance = await tokenContract.allowance(
        signer.address,
        spenderAddress
      );

      if (currentAllowance < amount) {
        const approveTx = await tokenContract.approve(spenderAddress, amount);
        await approveTx.wait(1);
      }
    } catch (error) {
      console.error(`Approval failed: ${error}`);
      throw error;
    }
  };

  getSupportedTokens = async () => {
    return Object.keys(KYBERSWAP_TOKENS_INFO);
  };

  getEncodedSwapData = async (routeData, slippage) => {
    try {
      const signer = await getSigner();
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

      const response = await fetch(
        `${KYBERSWAP_AGGREGATOR_API_URL}/route/build`,
        {
          method: "POST",
          headers: {
            "x-client-id": "EconovaBot",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            routeSummary: routeData,
            sender: signer.address,
            recipient: signer.address,
            slippageTolerance: slippage * 100,
            deadline,
            source: "EconovaBot",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to encode swap data: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(`API error: ${data.message}`);
      }

      return data.data.data;
    } catch (error) {
      console.error(`Failed to encode swap data: ${error}`);
      throw error;
    }
  };
}

export default Kyberswap;
