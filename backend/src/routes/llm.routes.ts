import express from "express";
import { processLLMRequest } from "../controllers/llm.controllers";
const llmRoutes = express.Router();
llmRoutes.post("/", processLLMRequest);
export default llmRoutes;
