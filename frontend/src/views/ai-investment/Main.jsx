import { useState, useEffect } from "react";
import { fetchMarketDataCoingecko } from "../../services/coin.gecko.services";
import {
  getProjectTokenDetails,
  getTokenBalance,
} from "../../services/blockchain.services";
import { toast } from "react-toastify";
import { APP_NAME, CHAIN_ID, ETH_ADDRESS } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import logoUrl from "@/assets/images/logo.png";
import Kyberswap, {
  KYBERSWAP_TOKENS_INFO,
} from "../../services/kyber.swap.services";
import { sonic, fantomSonicTestnet } from "viem/chains";

export default function InvestmentAI() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [rebalancing, setRebalancing] = useState(false);
  const [portfolio, setPortfolio] = useState({});
  const isTesting = true;

  const normalizeBalance = (balance, decimals) =>
    Number(balance) / 10 ** Number(decimals);
  const chainId = isTesting ? CHAIN_ID : sonic.id;

  const kyberswap = new Kyberswap(chainId);
  const [targetAllocations, setTargetAllocations] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        setLoading(true);

        const coinDetails = KYBERSWAP_TOKENS_INFO.USDC;

        const assetsInfo = [
          {
            coingeckoId: "sonic-3",
            name: "Sonic Token",
            symbol: "SONIC",
            address: ETH_ADDRESS,
          },
          {
            coingeckoId: "usd-coin",
            name: coinDetails.name,
            symbol: coinDetails.symbol,
            address: coinDetails.address,
          },
        ];

        if (isTesting) {
          const { tokenAddress, name } = await getProjectTokenDetails();
          const usdcTestIndex = assetsInfo.findIndex(
            (asset) => asset.coingeckoId === "usd-coin"
          );

          if (usdcTestIndex !== -1) {
            assetsInfo[usdcTestIndex] = {
              ...assetsInfo[usdcTestIndex],
              address: tokenAddress,
              name: name,
              symbol: name,
            };
          }
        }

        const results = await Promise.all(
          assetsInfo.map(async (asset) => {
            try {
              const [{ data: marketData }, balance] = await Promise.all([
                fetchMarketDataCoingecko({
                  path: `/coins/${asset.coingeckoId}/market_chart`,
                  queryParams: { vs_currency: "usd", days: 7 },
                }),
                getTokenBalance(asset.address, chainId),
              ]);
              return {
                asset,
                price: marketData?.prices?.[0]?.[1] || 0,
                balance,
                coingeckoId: asset.coingeckoId,
              };
            } catch (err) {
              console.error(`Failed to fetch data for ${asset.name}:`, err);
              return {
                asset,
                price: 0,
                balance: { balance: "0", decimals: "18" },
              };
            }
          })
        );

        console.log("Fetched data:", results);

        // Process fetched data
        const updatedPrices = {};
        const updatedPortfolio = {};
        let totalBalance = 0;

        results.forEach(({ asset, price, balance }) => {
          const tokenBalance = normalizeBalance(
            balance.balance,
            balance.decimals
          );
          updatedPrices[asset.coingeckoId] = price;
          updatedPortfolio[asset.coingeckoId] = tokenBalance;
          totalBalance += tokenBalance * price;
        });

        setPortfolio(updatedPortfolio);

        if (totalBalance > 0) {
          setStrategy({
            assets: results.map(({ asset }) => ({
              name: asset.name,
              allocation:
                ((updatedPortfolio[asset.coingeckoId] *
                  updatedPrices[asset.coingeckoId]) /
                  totalBalance) *
                100,
              coingeckoId: asset.coingeckoId,
            })),
          });
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError("Failed to load market data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRebalance = async () => {
    if (!strategy) return;

    setRebalancing(true);
    toast.info("Calculating optimal rebalancing strategy...");

    try {
      const rebalanceOrders = strategy.assets.map((asset) => {
        const currentAllocation = asset.allocation;
        const targetAllocation = targetAllocations[asset.coingeckoId];

        const action = currentAllocation < targetAllocation ? "Buy" : "Sell";
        const amountToAdjust = Math.abs(currentAllocation - targetAllocation);

        return {
          name: asset.name,
          action,
          amount: amountToAdjust,
          tokenAddress: portfolio[asset.coingeckoId]?.address || ETH_ADDRESS,
        };
      });

      console.log("Rebalancing Orders:", rebalanceOrders);

      const validOrders = rebalanceOrders.filter((order) => order.amount > 0);

      const swapPromises = validOrders.map(async (order) => {
        const { action, amount, tokenAddress, name } = order;

        toast.info(`Executing ${action} order for ${name}...`);

        try {
          const swapResult = await kyberswap.swap({
            sourceToken: action === "Sell" ? tokenAddress : ETH_ADDRESS,
            destToken: action === "Buy" ? tokenAddress : ETH_ADDRESS,
            sourceAmount: amount,
          });

          if (swapResult?.success) {
            toast.success(`Successfully rebalanced ${name}.`);
          } else {
            throw new Error(`Swap failed for ${name}`);
          }
        } catch (error) {
          console.error(`Error rebalancing ${name}:`, error);
          toast.error(`Failed to rebalance ${name}.`);
        }
      });

      await Promise.all(swapPromises);

      toast.success("Portfolio rebalanced successfully!");
    } catch (error) {
      console.error("Rebalance error:", error);
      toast.error("Failed to rebalance portfolio. Please try again.");
    } finally {
      setRebalancing(false);
    }
  };

  const handleSliderChange = (coingeckoId, value) => {
    const otherAsset = Object.keys(targetAllocations).find(
      (id) => id !== coingeckoId
    );
    setTargetAllocations({ [coingeckoId]: value, [otherAsset]: 100 - value });
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} Portfolio</span>
        </a>
      </h2>

      {loading ? (
        <div className="flex items-center space-x-2 ">
          <FaSpinner className="animate-spin" />
          <span>Loading market data...</span>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : strategy ? (
        <div className="bg-white dark:bg-darkmode-600 p-6 rounded-md shadow-md w-full max-w-md mx-auto">
          <div className="mt-4 space-y-6">
            <div className="space-y-3">
              {strategy.assets.map((asset, index) => (
                <div key={index} className="mb-2">
                  <p className="text-sm font-medium ">
                    {asset.name}:{" "}
                    <span className="font-semibold">
                      {asset.allocation.toFixed(2)}%
                    </span>
                  </p>
                  <div className="relative w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${asset.allocation}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {Object.keys(portfolio).map((id) => {
                const asset = strategy.assets.find((a) => a.coingeckoId === id);
                if (!asset) return null;

                return (
                  <div key={id} className="mb-2">
                    <p className="text-sm font-medium ">{asset.name}</p>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.01"
                      value={targetAllocations[id].toFixed(2)}
                      onChange={(e) =>
                        handleSliderChange(id, Number(e.target.value))
                      }
                      className="w-full cursor-pointer transition-all"
                      aria-label={`Set target allocation for ${asset.name}`}
                    />
                    <p className="text-xs ">
                      Target Allocation:{" "}
                      <span className="font-semibold">
                        {targetAllocations[id]}%
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRebalance}
            disabled={rebalancing}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {rebalancing ? "Rebalancing..." : "Rebalance Portfolio"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

// get the price and market data of sonic token
// get the price and market data of stablecoin
// analyze the data to determine the best investment strategy
// get user current portfolio balance of each asset
// calculate the optimal allocation of each asset
// return the new investment strategy with the optimal allocation
// return the projected growth of the new investment strategy
// return the risk level of the new investment strategy
// determine the amount of each asset to buy/sell to rebalance the portfolio
// ask the user to confirm the rebalance
// execute the rebalance
