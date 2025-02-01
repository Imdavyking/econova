import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export class OpenAIService {
  private llm: ChatOpenAI;

  constructor(openAIApiKey: string) {
    this.llm = new ChatOpenAI({
      apiKey: openAIApiKey,
      model: "gpt-4o-mini",
    });
  }

  private async openAILLM(prompt: string): Promise<string | null> {
    try {
      const response = await this.llm.invoke([new HumanMessage(prompt)]);
      return response.content;
    } catch (error) {
      console.error("OpenAI LLM Error:", error);
      return null;
    }
  }

  private async promptLLM(prompt: string): Promise<string> {
    const openaiLLM = await this.openAILLM(prompt);
    return openaiLLM ? openaiLLM : "";
  }

  public async getNextAction(
    task: string,
    toolsDescription: { [key: string]: any },
    context: { [key: string]: any }
  ): Promise<{ [key: string]: any }> {
    const systemPrompt = new SystemMessage(`
    CREATIVE_ADDR (CREATIVE): 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    ETHEREUM_ADDR (ETHEREUM): 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    Task: ${task}
    Available tools: ${JSON.stringify(toolsDescription)}
    Current context: ${JSON.stringify(context)}
    Determine the next action to take based on the current context and available tools.
    Previous results can be referenced using {{result_X}} where X is the step number.
    Respond in JSON format as:
    {"tool": "tool_name", "args": "arguments"}
    if task is complete, respond with:
    {"tool": "TASK_COMPLETE", "args": ""}
    `);

    try {
      const nextAction = await this.promptLLM(systemPrompt.content);
      return JSON.parse(nextAction);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return { tool: "ERROR", args: "Invalid response format", error: error };
    }
  }
}

const tools = {
  donate: tool(() => undefined, {
    name: "donate",
    description: "Make a donation in USD (paid using native token).",
    schema: z.object({
      tokenAddress: z.string(),
      amountInUsd: z.union([z.number(), z.string()]),
    }),
  }),
  redeemCode: tool(() => undefined, {
    name: "redeemCode",
    description: "Redeem points for rewards.",
    schema: z.object({
      points: z.union([z.number(), z.string()]),
    }),
  }),
  addPoints: tool(() => undefined, {
    name: "addPoints",
    description: "Add points (measured in grams) to your account.",
    schema: z.object({
      weight: z.union([z.number(), z.string()]),
    }),
  }),
};

export async function runAI(messages: (AIMessage | HumanMessage)[]) {
  const llm = new ChatOpenAI({ model: "gpt-4o-mini" }).bind({
    tools: Object.values(tools),
  });
  const systemPrompt = new SystemMessage(
    "You are an assistant that converts user prompts into structured formats."
  );
  const result = await llm.invoke([systemPrompt, ...messages]);
  return { content: result.content, tool_calls: result.tool_calls };
}
