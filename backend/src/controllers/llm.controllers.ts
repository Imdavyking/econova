import { Request, Response } from "express";
import {
  runAIAgent,
  runAIAuditAgent,
  runDaoProposalAgent,
  runTxHashAgent,
} from "../services/agent.services";
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
  } catch (error: any) {
    console.error("LLM Controller Error:", error);
    res.status(200).json({ error: `Internal server error ${error.message}` });
  }
};

/**
 * Handles LLM Audit API requests
 * @route POST /api/llm/audit
 */
export const processTxHashRequest = async (req: Request, res: Response) => {
  try {
    const { txInfo } = req.body;

    if (!txInfo) {
      res.status(400).json({
        error: "Missing required fields: txHash",
      });
      return;
    }

    const generateActions = await runTxHashAgent([
      new HumanMessage(JSON.stringify(txInfo)),
    ]);

    res.json(generateActions);
  } catch (error: any) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: `Internal Server Error ${error.message}` });
  }
};

/**
 * Handles LLM Audit API requests
 * @route POST /api/llm/dao_analysis
 */
export const processDaoAnalysisRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const requiredFields = [
      "contractAddress",
      "proposalId",
      "proposer",
      "state",
      "etaSecondsQueue",
      "targets",
      "voteEnd",
      "voteStart",
      "description",
      "id",
      "calldatas",
      "votesFor",
      "votesAgainst",
      "weightVotesFor",
      "weightVotesAgainst",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    const generateActions = await runDaoProposalAgent([
      new HumanMessage(JSON.stringify(req.body)),
    ]);

    res.json(generateActions);
  } catch (error: any) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: `Internal Server Error ${error.message}` });
  }
};
