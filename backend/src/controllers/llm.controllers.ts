import { Request, Response } from "express";
import { OpenAIService } from "../services/openai.services";
import dotenv from "dotenv";
dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY || "your-api-key";
const aiService = new OpenAIService(openAIApiKey);

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

    // Get AI-generated next action
    const nextAction = await aiService.getNextAction(
      task,
      toolsDescription,
      context
    );

    res.json(nextAction);
  } catch (error) {
    console.error("LLM Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
