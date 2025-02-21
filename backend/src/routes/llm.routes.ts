import express from "express";
import {
  processLLMAuditRequest,
  processLLMRequest,
} from "../controllers/llm.controllers";
const llmRoutes = express.Router();
llmRoutes.post("/", processLLMRequest);
llmRoutes.post("/audit", processLLMAuditRequest);
export default llmRoutes;
