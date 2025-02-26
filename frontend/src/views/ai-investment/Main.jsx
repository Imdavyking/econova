import { useState, useEffect } from "react";

const fakeInvestmentStrategy = {
  riskLevel: "Moderate",
  assets: [
    { name: "Sonic Token", allocation: 40 },
    { name: "Stablecoin", allocation: 30 },
    { name: "DeFi Index Fund", allocation: 30 },
  ],
  projectedGrowth: "12% annually",
};

export default function InvestmentAI() {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setStrategy(fakeInvestmentStrategy);
      setLoading(false);
    }, 2000);
  }, []);

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
                  {asset.name}: {asset.allocation}%
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
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Rebalance Portfolio
          </button>
        </div>
      )}
    </div>
  );
}
