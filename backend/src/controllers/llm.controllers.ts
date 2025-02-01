import { Request, Response } from "express";
import { runAIAgent } from "../services/agent.services";
import dotenv from "dotenv";
import { HumanMessage } from "@langchain/core/messages";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY || "your-api-key";

/**
 * Handles LLM API requests
 * @route POST /api/llm
 */
export const processLLMRequest = async (req: Request, res: Response) => {
  try {
    const { task, context, toolsDescription } = req.body;

    // Validate input
    if (!task) {
      res.status(400).json({
        error: "Missing required fields: task",
      });
      return;
    }

    if (!toolsDescription) {
      res.status(400).json({
        error: "Missing required fields: toolsDescription",
      });
      return;
    }

    if (!context) {
      res.status(400).json({
        error: "Missing required fields: context",
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
