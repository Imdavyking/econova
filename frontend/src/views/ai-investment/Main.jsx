import { useState, useEffect } from "react";
import axios from "axios";
// return "$coinGeckoBaseurl/coins/$coinGeckoId/market_chart?vs_currency=$defaultCurrency&days=$days";
const API_URL = "https://api.coingecko.com/api/v3/coins/usd-coin/market_chart";
const assets = ["sonic-3", "usd-coin"];

// curl -X GET "https://pro-api.coingecko.com/api/v3" -H "x-cg-pro-api-key: YOUR_API_KEY"

// CG-eppKJk3qk4wLAcWnj1eKnAcA


export default function InvestmentAI() {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);
  const [prices, setPrices] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [rebalancing, setRebalancing] = useState(false);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await axios.get(API_URL, {
          params: {
            days: 7,
            vs_currencies: "usd",
          },
        });

        console.log(response.data);

        //   {
        //     "sonic-3": {
        //         "usd": 0.722857
        //     },
        //     "usd-coin": {
        //         "usd": 0.999808
        //     }
        // }

        setPrices(response.data);

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
      <h1 className="text-2xl font-bold mb-4 text-gray-900">
        AI Investment Strategy
      </h1>
      {loading ? (
        <p className="text-gray-500">Analyzing market data...</p>
      ) : (
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
