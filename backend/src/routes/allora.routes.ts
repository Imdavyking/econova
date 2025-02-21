import express from "express";
import { getPriceInference } from "../controllers/allora.controllers";

const alloraRoutes = express.Router();
alloraRoutes.get("/price-inference", getPriceInference);

export default alloraRoutes;
