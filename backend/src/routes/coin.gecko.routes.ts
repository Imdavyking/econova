import express from "express";
import { getPriceFromCoinGecko } from "../controllers/coin.gecko.controllers";
const coinGeckoPriceRoutes = express.Router();
coinGeckoPriceRoutes.post("/", getPriceFromCoinGecko);
export default coinGeckoPriceRoutes;
