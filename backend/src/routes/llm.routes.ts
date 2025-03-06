import express from "express";
import {
  processDaoAnalysisRequest,
  processLLMAuditRequest,
  processLLMRequest,
  processTxHashRequest,
} from "../controllers/llm.controllers";
const llmRoutes = express.Router();
llmRoutes.post("/", processLLMRequest);
llmRoutes.post("/audit", processLLMAuditRequest);
llmRoutes.post("/tx_hash", processTxHashRequest);
llmRoutes.post("/dao_analysis", processDaoAnalysisRequest);
export default llmRoutes;
