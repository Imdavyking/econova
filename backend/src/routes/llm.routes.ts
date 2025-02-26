import express from "express";
import {
  processLLMAuditRequest,
  processLLMRequest,
  processTxHashRequest,
} from "../controllers/llm.controllers";
const llmRoutes = express.Router();
llmRoutes.post("/", processLLMRequest);
llmRoutes.post("/audit", processLLMAuditRequest);
llmRoutes.post("/tx_hash", processTxHashRequest);
export default llmRoutes;
