import { SERVER_URL } from "../utils/constants";
export const fetchMarketDataCoingecko = async ({ path, queryParams }) => {
  const response = await fetch(`${SERVER_URL}/api/coin-gecko-price`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path, queryParams }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data from CoinGecko");
  }
  return response.json();
};
