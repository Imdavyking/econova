import { Request, Response } from "express";
import { fetchPriceFromCoinGecko } from "../services/coingecko.services";
import initializeRedis from "../utils/redis.app";
import { REDIS_CACHE_TIME } from "../config/database";

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

    const cacheKey = `${path}-${JSON.stringify(queryParams)}`;
    const redis = await initializeRedis();

    if (data) {
      await redis.set(cacheKey, JSON.stringify(data), "EX", REDIS_CACHE_TIME);
    }

    if (!data) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        res.json({ data: JSON.parse(cachedData) });
        return;
      }
    }
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
