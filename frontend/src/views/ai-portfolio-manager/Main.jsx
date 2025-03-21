import { useState, useEffect } from "react";
import { fetchMarketDataCoingecko } from "../../services/coin.gecko.services";
import { getTokenBalance } from "../../services/blockchain.services";
import { toast } from "react-toastify";
import { APP_NAME, CHAIN_ID, NATIVE_TOKEN } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";

import logoUrl from "@/assets/images/logo.png";
import Kyberswap, {
  KYBERSWAP_TOKENS_INFO,
} from "../../services/kyber.swap.services";
import { Link } from "react-router-dom";

export default function InvestmentAI() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [rebalancing, setRebalancing] = useState(false);
  const [portfolio, setPortfolio] = useState({});
  const [totalUsdBalance, setTotalUsdBalance] = useState(0);

  const normalizeBalance = (balance, decimals) =>
    Number(balance) / 10 ** Number(decimals);

  const [targetAllocations, setTargetAllocations] = useState({});

  const coinDetails = KYBERSWAP_TOKENS_INFO.USDC;

  const assetsInfo = [
    {
      coingeckoId: "sonic-3",
      name: "Sonic Token",
      symbol: "SONIC",
      address: NATIVE_TOKEN,
    },
    {
      coingeckoId: "usd-coin",
      name: coinDetails.name,
      symbol: coinDetails.symbol,
      address: coinDetails.address,
    },
  ];

  async function fetchData() {
    try {
      setError(null);
      setLoading(true);

      let updatedAssetsInfo = await updateAssetsInfo();
      const results = await fetchAssetData(updatedAssetsInfo);
      processFetchedData(results);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError("Failed to load market data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function updateAssetsInfo() {
    return [...assetsInfo];
  }

  async function fetchAssetData(updatedAssetsInfo) {
    return Promise.all(
      updatedAssetsInfo.map(async (asset) => {
        try {
          const [{ data: marketData }, balance] = await Promise.all([
            fetchMarketDataCoingecko({
              path: `/coins/${asset.coingeckoId}/market_chart`,
              queryParams: { vs_currency: "usd", days: 7 },
            }),
            getTokenBalance({
              tokenAddress: asset.address,
              switchChainId: CHAIN_ID,
            }),
          ]);

          const price = marketData?.prices?.[0]?.[1] || 0;
          return { asset, price, balance };
        } catch (err) {
          console.error(`Failed to fetch data for ${asset.name}:`, err);
          return { asset, price: 0, balance: { balance: "0", decimals: "18" } };
        }
      })
    );
  }

  function processFetchedData(results) {
    const updatedPrices = {};
    const updatedPortfolio = {};
    let totalBalance = 0;

    for (const { asset, price, balance } of results) {
      const tokenBalance = normalizeBalance(balance.balance, balance.decimals);
      updatedPrices[asset.coingeckoId] = price;
      updatedPortfolio[asset.coingeckoId] = tokenBalance;
      totalBalance += tokenBalance * price;
    }

    setTotalUsdBalance(totalBalance);

    setPortfolio(updatedPortfolio);

    if (totalBalance > 0) {
      const strategyAssets = results.map(({ asset }) => ({
        name: asset.name,
        coingeckoId: asset.coingeckoId,
        balance: updatedPortfolio[asset.coingeckoId],
        price: updatedPrices[asset.coingeckoId],
        allocation:
          ((updatedPortfolio[asset.coingeckoId] *
            updatedPrices[asset.coingeckoId]) /
            totalBalance) *
          100,
        tokenAddress: asset.address,
      }));

      setStrategy({ assets: strategyAssets });
      setTargetAllocations(
        strategyAssets.reduce((acc, { coingeckoId, allocation }) => {
          acc[coingeckoId] = allocation;
          return acc;
        }, {})
      );
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleRebalance = async () => {
    if (!strategy || !targetAllocations) {
      console.error("Strategy or target allocations are missing.");
      toast.error("Portfolio data is unavailable.");
      return;
    }

    setRebalancing(true);
    toast.info("Calculating optimal rebalancing strategy...");

    try {
      const rebalanceOrders = strategy.assets
        .map((asset) => {
          const currentAllocation = asset.allocation;
          const targetAllocation = targetAllocations[asset.coingeckoId] || 0;

          if (currentAllocation === targetAllocation) return null;

          const action = currentAllocation < targetAllocation ? "Buy" : "Sell";
          const amountPercent = Math.abs(currentAllocation - targetAllocation);
          const amountInUsd = (amountPercent / 100) * totalUsdBalance;
          const amountInTokens = asset.price ? amountInUsd / asset.price : 0;

          return {
            name: asset.name,
            balance: asset.balance,
            price: asset.price,
            action,
            amountPercent,
            amountInUsd,
            amountInTokens,
            tokenAddress: asset.tokenAddress,
          };
        })
        .filter((order) => order && order.amountInTokens > 0);

      if (rebalanceOrders.length < 2) {
        console.warn("Not enough orders to execute a rebalance.");
        toast.info("No significant rebalancing needed.");
        setRebalancing(false);
        return;
      }

      const kyberswap = new Kyberswap(CHAIN_ID);

      for (const sellOrder of rebalanceOrders.filter(
        (o) => o.action === "Sell"
      )) {
        const buyOrder = rebalanceOrders.find((o) => o.action === "Buy");
        if (!buyOrder) continue;

        toast.info(`Swapping ${sellOrder.name} for ${buyOrder.name}...`);

        await kyberswap.swap({
          sourceToken: sellOrder.tokenAddress,
          destToken: buyOrder.tokenAddress,
          sourceAmount: sellOrder.amountInTokens,
        });

        toast.success(
          `Successfully swapped ${sellOrder.name} for ${buyOrder.name}`
        );
      }

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
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} Portfolio</span>
        </Link>
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
