import { Request, Response } from "express";
import { fetchPriceFromCoinGecko } from "../services/coingecko.services";

export const getPriceFromCoinGecko = async (req: Request, res: Response) => {
  try {
    const { path, queryParams } = req.body;
    if (!path) {
      res.status(400).json({ error: "Missing path" });
      return;
    }

    if (!queryParams) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    const data = await fetchPriceFromCoinGecko({
      path: path as string,
      queryParams: queryParams as Record<string, any>,
    });
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
