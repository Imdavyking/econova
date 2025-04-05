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
import { environment } from "../utils/config";
import { KYBERSWAP_TOKENS_INFO } from "../utils/constants";
dotenv.config();
const openAIApiKey = environment.OPENAI_API_KEY!;
const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const assets = [
  {
    name: "ETH",
    symbol: "ETH",
    address: NATIVE_TOKEN,
    decimals: 18,
  },
];

const categorySchema = Object.values(charityCategories).map(
  (e) => `${e}`
) as unknown as readonly [string, ...string[]];

const availableTokens = assets.map((asset) => asset.address) as [string];
const tokenSchema = z.enum(availableTokens);

const tokensPrompt = `
============ TOKENS ============
${JSON.stringify(Object.values(KYBERSWAP_TOKENS_INFO))}
============ END OF TOKENS ============`;

export async function runAIAgent(messages: (AIMessage | HumanMessage)[]) {
  const tools = {
    alloraPredict: tool(() => undefined, {
      name: "alloraPredict",
      description: "Get price prediction for a token.",
      schema: z.object({
        topicId: z.number().nullable(),
        topicName: z.string().nullable(),
      }),
    }),
    tokenBalance: tool(() => undefined, {
      name: "tokenBalance",
      description: "Get the balance of a token in a wallet.",
      schema: z.object({
        tokenAddress: tokenSchema.describe("The token to check"),
      }),
    }),
    walletAddress: tool(() => undefined, {
      name: "walletAddress",
      description: "Get the wallet address of the user.",
      schema: z.object({}),
    }),
    swapToken: tool(() => undefined, {
      name: "swapToken",
      description: "Swap tokens on a decentralized exchange.",
      schema: z.object({
        sourceToken: tokenSchema.describe("The token to swap from"),
        destToken: tokenSchema.describe("The token to swap to"),
        sourceAmount: z.number().describe("The amount to swap"),
      }),
    }),
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

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openAIApiKey,
  }).bind({
    tools: Object.values(tools),
  });

  const separator = " | --- | ";

  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats, try to use tool_calls than content always.
    Strictly only respond to the last message after the last occurrence of the separator ('${separator}'), Completely ignore all previous messages unless the last message is unclear or explicitly requires context from them, If there is no separator ('${separator}') in the input, take the entire context into account. 
    never return ('${separator}') in the response.
    ${tokensPrompt}
    if you don't know the token address, ask the user to provide it.
    SONIC_CHAIN_ID: 146
    BSC_CHAIN_ID: 56
    The categories available are:
    ${JSON.stringify(charityCategories)}
    
    For each donation request, map the provided category to an index as follows:
    ${Object.entries(charityCategories)
      .map(([category, index]) => `- ${category}: ${index}`)
      .join("\n")}
    
    If a user provides a category (e.g., "Health"), select the corresponding index number (e.g., 1). You will return the selected index number as part of your response, in the format: "<index_number>".

    For quiz questions, you will should return quiz questions very randomized and their corresponding answers,always in json in tool_calls and not content
    `
  );
  const result = await llm.invoke([systemPrompt, ...messages]);

  return { content: result.content, tool_calls: result.tool_calls };
}

export async function runAIAuditAgent(messages: (AIMessage | HumanMessage)[]) {
  const auditTools = {
    auditResponse: tool(() => undefined, {
      name: "auditResponse",
      description: "Get price prediction for a token.",
      schema: z.object({
        rating: z.number().describe("The rating of the audit"),
        overview: z.string().describe("Detailed breakdown of the rating"),
        issues_detected: z.object({
          severe: z.array(z.string()).describe("Severe issues"),
          major: z.array(z.string()).describe("Major risks"),
          moderate: z.array(z.string()).describe("Moderate concerns"),
          minor: z.array(z.string()).describe("Minor issues"),
        }),
        fix_recommendations: z
          .array(z.string())
          .describe("Actionable security improvements"),
        efficiency_tips: z
          .array(z.string())
          .describe("Specific gas optimization tips"),
      }),
    }),
  };
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openAIApiKey,
  }).bind({
    tools: Object.values(auditTools),
  });

  const systemPrompt = new SystemMessage(
    `You are an expert smart contract security auditor. 
    Your task is to conduct a strict and thorough review of the provided Solidity smart contract, ensuring it meets the highest security and efficiency standards. Any security issue, no matter how minor, must be identified.
    also show line numbers where the issues are found.

Strict Rating System
⭐ 5 Stars: Awarded only if the contract has zero vulnerabilities, follows all security best practices, uses gas optimally, and implements the latest Solidity features correctly.
⭐ 4 Stars: Given if the contract has no critical or high-risk vulnerabilities but may have 1-2 moderate concerns that are not easily exploitable.
⭐ 3 Stars: Assigned if there are no critical flaws but includes at least one high-severity issue or multiple moderate concerns.
⭐ 2 Stars: Given if the contract has at least one critical flaw or multiple high-risk vulnerabilities that make it unsafe for deployment.
⭐ 1 Star: If the contract contains multiple critical and high-risk issues, making it highly insecure.
⭐ 0 Stars: Assigned if the contract has fundamental security flaws that leave it open to immediate exploitation.

======= Security Threat Classification =======
===== Severe Issues (Any of these results in a 2-star rating or lower) ===== 
Reentrancy vulnerabilities
Unchecked external calls
Integer overflow/underflow risks
Broken access control mechanisms
Unprotected selfdestruct or delegatecall
Manipulable timestamps
Lack of input validation
Unprotected critical functions

===== Major Concerns (Any of these prevents a 5-star rating) ===== 
Missing event emissions for important state changes
Inefficient gas usage
Poor error handling
State variable shadowing
Complex fallback function logic
Implicit visibility levels on functions or variables

${tokensPrompt}
`
  );
  const result = await llm.invoke([systemPrompt, ...messages]);

  return { content: result.content, tool_calls: result.tool_calls };
}

export async function runTxHashAgent(messages: (AIMessage | HumanMessage)[]) {
  const tools = {
    txHashSummary: tool(() => undefined, {
      name: "txHashSummary",
      description: "Get a summary of a transaction hash.",
      schema: z.object({
        hash: z.string().describe("The transaction hash"),
        summary: z.string().describe("The summary of the transaction"),
        legalAdvice: z.string().describe("Legal advice on the transaction"),
      }),
    }),
  };
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openAIApiKey,
  }).bind({
    tools: Object.values(tools),
  });

  const systemPrompt = new SystemMessage(
    `You are an expert in blockchain transactions. Your task is to analyze the provided transaction hash and provide a detailed summary of the transaction.
make this as detailed as possible, to beginners and experts alike.
${tokensPrompt}
`
  );
  const result = await llm.invoke([systemPrompt, ...messages]);

  return { content: result.content, tool_calls: result.tool_calls };
}
export async function runDaoProposalAgent(
  messages: (AIMessage | HumanMessage)[]
) {
  const tools = {
    analyzeProposal: tool(() => undefined, {
      name: "analyzeProposal",
      description:
        "Analyze a governance proposal, predicting its impact and providing recommendations.",
      schema: z.object({
        proposalId: z
          .string()
          .describe("The unique ID of the governance proposal"),
        summary: z.string().describe("A concise summary of the proposal"),
        impactAnalysis: z
          .string()
          .describe("Analysis of the potential impact of the proposal"),
        recommendation: z
          .string()
          .describe(
            "The AI's recommendation on whether to support or reject the proposal"
          ),
      }),
    }),
  };
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openAIApiKey,
  }).bind({
    tools: Object.values(tools),
  });

  const systemPrompt = new SystemMessage(
    `You are an AI agent designed to assist in the governance of DeFAI projects on the Sonic blockchain. Your role is to analyze governance proposals, predict their impact, and provide informed recommendations to token holders, ensuring more strategic and data-driven voting decisions.  

Your key functions include:  
1. Proposal Analysis - Summarize proposals, highlight risks, and identify affected stakeholders.  
2. Impact Prediction - Use on-chain and off-chain data to forecast potential economic, security, and adoption outcomes.  
3. Voting Recommendations - Provide data-driven insights, ranking proposals based on historical trends, market conditions, and community sentiment.  
4. Sentiment & Risk Detection - Monitor discussions to detect manipulation, identify conflicts of interest, and flag controversial aspects.  
5. Voting Assistance - Notify token holders about key votes, offer tailored recommendations, and facilitate vote delegation.  
6. Transparency & Auditability - Maintain a verifiable record of AI recommendations, ensuring governance integrity and allowing for community challenges.  

You must ensure accuracy, neutrality, and security in all analyses. Your insights should be clear, unbiased, and rooted in real-time blockchain data and sentiment analysis. Token holders rely on your guidance to make informed decisions that shape the future of the ecosystem.
${tokensPrompt}
`
  );
  const result = await llm.invoke([systemPrompt, ...messages]);

  return { content: result.content, tool_calls: result.tool_calls };
}
