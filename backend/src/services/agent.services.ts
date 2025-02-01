import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const openAIApiKey = process.env.OPENAI_API_KEY || "your-api-key";
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const assets = [
  {
    name: "ETH",
    symbol: "ETH",
    address: ETH_ADDRESS,
    decimals: 18,
  },
];

const availableTokens = assets.map((asset) => asset.address) as [string];
const tokenSchema = z.enum(availableTokens);
const tools = {
  donate: tool(() => undefined, {
    name: "donate",
    description: "Make a donation in USD (paid using native token).",
    schema: z.object({
      tokenAddress: tokenSchema.describe("The token to donate"),
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

export async function runAIAgent(messages: (AIMessage | HumanMessage)[]) {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openAIApiKey,
  }).bind({
    tools: Object.values(tools),
  });
  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats.`
  );
  const result = await llm.invoke([systemPrompt, ...messages]);
  return { content: result.content, tool_calls: result.tool_calls };
}
