import { Request, Response } from "express";
import { runAIAgent, runAIAuditAgent } from "../services/agent.services";
import dotenv from "dotenv";
import { HumanMessage } from "@langchain/core/messages";
dotenv.config();

/**
 * Handles LLM API requests
 * @route POST /api/llm
 */
export const processLLMRequest = async (req: Request, res: Response) => {
  try {
    const { task } = req.body;

    if (!task) {
      res.status(400).json({
        error: "Missing required fields: task",
      });
      return;
    }

    const generateActions = await runAIAgent([new HumanMessage(task)]);

    res.json(generateActions);
  } catch (error) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Handles LLM Audit API requests
 * @route POST /api/llm/audit
 */
export const processLLMAuditRequest = async (req: Request, res: Response) => {
  try {
    const { contractCode } = req.body;

    if (!contractCode) {
      res.status(400).json({
        error: "Missing required fields: contractCode",
      });
      return;
    }

    const generateActions = await runAIAuditAgent([
      new HumanMessage(contractCode),
    ]);

    res.json(generateActions);
  } catch (error) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Handles LLM Audit API requests
 * @route POST /api/llm/audit
 */
export const processTxHashRequest = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;

    if (!txHash) {
      res.status(400).json({
        error: "Missing required fields: txHash",
      });
      return;
    }

    const generateActions = await runAIAuditAgent([new HumanMessage(txHash)]);

    res.json(generateActions);
  } catch (error) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
