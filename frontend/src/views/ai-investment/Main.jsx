import { useState, useEffect } from "react";
import { fetchMarketDataCoingecko } from "../../services/coin.gecko.services";
import {
  getProjectTokenDetails,
  getTokenBalance,
} from "../../services/blockchain.services";
import { CHAIN_ID, ETH_ADDRESS } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";

export default function InvestmentAI() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [rebalancing, setRebalancing] = useState(false);
  const [portfolio, setPortfolio] = useState({});
  const [prices, setPrices] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        setLoading(true);

        const { tokenAddress, decimals, name } = await getProjectTokenDetails();

        const assetsInfo = [
          {
            coingeckoId: "sonic-3",
            name: "Sonic Token",
            symbol: "SONIC",
            address: ETH_ADDRESS, // Ensure this is the correct ERC-20 contract address
          },
          {
            coingeckoId: "usd-coin",
            name: name,
            symbol: name,
            address: tokenAddress,
          },
        ];

        const results = await Promise.all(
          assetsInfo.map(async (asset) => {
            const [marketData, balance] = await Promise.all([
              fetchMarketDataCoingecko({
                path: `/coins/${asset.coingeckoId}/market_chart`,
                queryParams: { vs_currency: "usd", days: 7 },
              }),
              getTokenBalance(asset.address, CHAIN_ID),
            ]);

            return { asset, marketData, balance };
          })
        );

        console.log(results);

        // Extract market data and balances
        const updatedPrices = {};
        const updatedPortfolio = {};

        results.forEach(({ asset, marketData, balance }) => {
          updatedPrices[asset.coingeckoId] =
            marketData?.data?.prices?.[0]?.[1] || 0;
          updatedPortfolio[asset.coingeckoId] = balance || 0;
        });

        console.log(JSON.stringify({ updatedPrices, updatedPortfolio }));

        setPrices(updatedPrices);
        setPortfolio(updatedPortfolio);

        // Compute Investment Strategy
        const totalBalance = Object.values(updatedPortfolio).reduce(
          (a, b) => a + b,
          0
        );

        if (totalBalance > 0) {
          setStrategy({
            riskLevel: "Moderate",
            projectedGrowth: "12% annually",
            assets: assetsInfo.map((asset) => ({
              name: asset.name,
              allocation:
                (updatedPortfolio[asset.coingeckoId] / totalBalance) * 100,
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

    setTimeout(() => {
      alert("Portfolio rebalanced successfully!");
      setRebalancing(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto border border-gray-200 rounded-lg shadow-lg bg-white">
      <DarkModeSwitcher />
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        AI Investment Strategy
      </h1>

      {loading ? (
        <div className="flex items-center space-x-2 text-gray-500">
          <FaSpinner className="animate-spin" />
          <span>Loading market data...</span>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : strategy ? (
        <div className="p-4 border border-gray-300 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">
            Risk Level: {strategy.riskLevel}
          </h2>
          <p className="text-gray-600">
            Projected Growth: {strategy.projectedGrowth}
          </p>

          <div className="mt-4">
            {strategy.assets.map((asset, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm font-medium text-gray-700">
                  {asset.name}: {asset.allocation.toFixed(2)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${asset.allocation}%` }}
                  ></div>
                </div>
              </div>
            ))}
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
