import { useState, useEffect } from "react";
import axios from "axios";
import { fetchMarketDataCoingecko } from "../../services/coin.gecko.services";
import { getTokenBalance } from "../../services/blockchain.services";
import { CHAIN_ID, ETH_ADDRESS } from "../../utils/constants";
import { FaSpinner } from "react-icons/fa";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
// return "$coinGeckoBaseurl/coins/$coinGeckoId/market_chart?vs_currency=$defaultCurrency&days=$days";
const API_URL = "https://api.coingecko.com/api/v3/coins/usd-coin/market_chart";
const assets = ["sonic-3", "usd-coin"];

export default function InvestmentAI() {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);
  const [prices, setPrices] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [rebalancing, setRebalancing] = useState(false);

  const chainIdPortfolio = CHAIN_ID;

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const sonicMarketData = await fetchMarketDataCoingecko({
          path: "/coins/sonic-3/market_chart",
          queryParams: {
            vs_currency: "usd",
            days: 7,
          },
        });
        const usdMarketData = await fetchMarketDataCoingecko({
          path: "/coins/sonic-3/market_chart",
          queryParams: {
            vs_currency: "usd-coin",
            days: 7,
          },
        });

        console.log({ sonicMarketData, usdMarketData });

        //   {
        //     "sonic-3": {
        //         "usd": 0.722857
        //     },
        //     "usd-coin": {
        //         "usd": 0.999808
        //     }
        // }

        // setPrices(response.data);

        // getTokenBalance(ETH_ADDRESS, chainIdPortfolio); // sonic-3
        // getTokenBalance("0x", chainIdPortfolio); // usd-coin

        // Simulate fetching user portfolio
        const userPortfolio = {
          "sonic-3": 100,
          "usd-coin": 500,
        };
        setPortfolio(userPortfolio);

        // Compute investment strategy dynamically
        const totalBalance = Object.values(userPortfolio).reduce(
          (a, b) => a + b,
          0
        );

        const strategy = {
          riskLevel: "Moderate",
          projectedGrowth: "12% annually",
          assets: [
            {
              name: "Sonic Token",
              allocation: (userPortfolio["sonic-3"] / totalBalance) * 100,
            },
            {
              name: "Stablecoin",
              allocation: (userPortfolio["usd-coin"] / totalBalance) * 100,
            },
          ],
        };

        setStrategy(strategy);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  const handleRebalance = async () => {
    if (!strategy) return;
    setRebalancing(true);

    // Simulated rebalance action
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
        <p className="text-gray-500">Analyzing market data...</p>
      ) : (
        <></>
      )}
      {strategy ? (
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
      ) : (
        <></>
      )}
    </div>
  );
}

// get the price and market data of sonic token
// get the price and market data of stablecoin
// get the price and market data of DeFi index fund
// analyze the data to determine the best investment strategy
// get user current portfolio balance of each asset
// calculate the optimal allocation of each asset
// return the new investment strategy with the optimal allocation
// return the projected growth of the new investment strategy
// return the risk level of the new investment strategy
// determine the amount of each asset to buy/sell to rebalance the portfolio
// ask the user to confirm the rebalance
// execute the rebalance
