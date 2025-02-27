import { stat } from "fs";
import { environment } from "../utils/config";

const API_URL = "https://api.coingecko.com/api/v3";
const API_KEY = environment.COINGECKO_DEMO_API_KEY;

export const fetchPriceFromCoinGecko = async ({
  path,
  queryParams = {},
}: {
  path: string;
  queryParams?: Record<string, any>;
}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}${path}?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        x_cg_demo_api_key: API_KEY,
      },
    });

    if (!response.ok) {
      return {
        status: response.status,
        statusText: response.statusText,
        url: url,
        apiKey: API_KEY,
      };
      // throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return {
      status: response.status,
      statusText: response.statusText,
      url: url,
      apiKey: API_KEY,
      success: true,
    };

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
  }
};
