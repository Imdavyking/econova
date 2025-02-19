import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import { charityCategories } from "../utils/charity.categories";
import { fetchAlloraTopics, fetchInferenceByTopicID } from "./allora.services";
dotenv.config();
const openAIApiKey = process.env.OPENAI_API_KEY!;
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const assets = [
  {
    name: "ETH",
    symbol: "ETH",
    address: ETH_ADDRESS,
    decimals: 18,
  },
];

const categorySchema = Object.values(charityCategories).map(
  (e) => `${e}`
) as unknown as readonly [string, ...string[]];

const availableTokens = assets.map((asset) => asset.address) as [string];
const tokenSchema = z.enum(availableTokens);

const tools = {
  alloraPredict: tool(
    async (input) => {
      const { topicId, topicName } = input;
      if (topicId === null && topicName === null) {
        return "Prediction failed. Please provide a topic ID or topic name.";
      }
      if (topicId) {
        return await fetchInferenceByTopicID(topicName!, topicId);
      }
    },
    {
      name: "alloraPredict",
      description: "Get price prediction for a token.",
      schema: z.object({
        topicId: z.number().nullable(),
        topicName: z.string().nullable(),
      }),
    }
  ),
  bridge: tool(() => undefined, {
    name: "bridge",
    description: "Bridge tokens to another chain.",
    schema: z.object({
      bridgeAmount: z.number().describe("The amount to bridge"),
      chainIdTo: z.number().describe("The chain ID to bridge to"),
      chainIdFrom: z.number().describe("The chain ID to bridge from"),
    }),
  }),
  wrapSonic: tool(() => undefined, {
    name: "wrapSonic",
    description: "Wrap sonic to wS.",
    schema: z.object({
      amount: z.number().describe("The amount of sonic to wrap"),
    }),
  }),
  unwrapSonic: tool(() => undefined, {
    name: "unwrapSonic",
    description: "Unwrap wS to Sonic.",
    schema: z.object({
      amount: z.number().describe("The amount of wS to unwrap"),
    }),
  }),
  sendERC20Token: tool(() => undefined, {
    name: "sendERC20Token",
    description: "Send ERC20 tokens to a specific address.",
    schema: z.object({
      tokenAddress: z.string().describe("The token to send"),
      recipientAddress: z.string().describe("The address to send tokens to"),
      amount: z.number().describe("The amount of tokens to send"),
    }),
  }),
  sendSonic: tool(() => undefined, {
    name: "sendSonic",
    description: "Send SONIC (also called S) tokens to a specific address.",
    schema: z.object({
      recipientAddress: z
        .string()
        .describe("The address to send SONIC tokens to"),
      amount: z.number().describe("The amount of SONIC tokens to send"),
    }),
  }),
  quizQuestions: tool(() => undefined, {
    name: "quizQuestions",
    description: "Answer quiz questions.",
    schema: z.object({
      question: z.string().describe("The quiz question"),
      options: z.array(z.string()).describe("The quiz options"),
      correctAnswer: z.string().describe("The correct answer"),
    }),
  }),
  donate: tool(() => undefined, {
    name: "donate",
    description: "Donate funds to a specific foundation based on category.",
    schema: z.object({
      category: z.enum(categorySchema),
      tokenAddress: tokenSchema.describe("The token to donate"),
      amountInUsd: z
        .union([z.number(), z.string()])
        .describe("The amount in USD"),
    }),
  }),
  adviceOnHealth: tool(() => undefined, {
    name: "adviceOnHealth",
    description: "",
    schema: z.object({
      isHealthy: z.boolean().describe("user is healthy using BMI"),
      advice: z
        .string()
        .describe("AI advice to the user on how to improve their health"),
    }),
  }),
  redeemPoints: tool(() => undefined, {
    name: "redeemPoints",
    description: "Redeem points for rewards.",
    schema: z.object({
      points: z
        .union([z.number(), z.string()])
        .describe("The points to redeem"),
    }),
  }),
  deployToken: tool(() => undefined, {
    name: "deployToken",
    description: "Deploy a new token.",
    schema: z.object({
      name: z.string().describe("The token's name"),
      symbol: z.string().describe("The token's symbol"),
      initialSupply: z.number().describe("The token's initial supply"),
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

  const alloraTopics = await fetchAlloraTopics();

  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats.
    ============ ALLORA NETWORK ============
    ======== Topics on Allora Network ========
    ${alloraTopics}
    ======== End of Allora Network Topics ========
    For sending:
    WRAPPED_SONIC_CONTRACT_ADDRESS: ${
      process.env.WRAPPED_SONIC_CONTRACT_ADDRESS
    }
    SONIC_CHAIN_ID: 146
    BSC_CHAIN_ID: 56
    The categories available are:
    ${JSON.stringify(charityCategories)}
    
    For each donation request, map the provided category to an index as follows:
    ${Object.entries(charityCategories)
      .map(([category, index]) => `- ${category}: ${index}`)
      .join("\n")}
    
    If a user provides a category (e.g., "Health"), select the corresponding index number (e.g., 1). You will return the selected index number as part of your response, in the format: "<index_number>".

    For quiz questions, you will should return quiz questions very randomized and their corresponding answers.
    `
  );
  const result = await llm.invoke([systemPrompt, ...messages]);
  return { content: result.content, tool_calls: result.tool_calls };
}
