import { environment } from "../utils/config";

const API_URL = "https://pro-api.coingecko.com/api/v3";
const API_KEY = environment.COINGECKO_API_KEY;

const fetchFromCoinGecko = async (path: string, queryParams = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}${path}?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-cg-pro-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Data from ${path}:`, data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
  }
};
