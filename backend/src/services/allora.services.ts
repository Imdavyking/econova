import {
  AlloraAPIClient,
  ChainSlug,
  PriceInferenceToken,
  PriceInferenceTimeframe,
} from "@alloralabs/allora-sdk";
import dotenv from "dotenv";
import { environment } from "../utils/config";
dotenv.config();

const alloraClient = new AlloraAPIClient({
  chainSlug:
    environment.ALLORA_NETWORK === "mainnet"
      ? ChainSlug.MAINNET
      : ChainSlug.TESTNET,
  apiKey: environment.ALLORA_API_KEY || "UP-8cbc632a67a84ac1b4078661",
});

/**
 * Fetch all topics from Allora Network.
 * @returns A list of topics.
 */
export const fetchAlloraTopics = async () => {
  try {
    const alloraTopics = await alloraClient.getAllTopics();

    let output = "Allora Network Topics: \n";
    for (const topic of alloraTopics) {
      output += `Topic Name: ${topic.topic_name}\n`;
      output += `Topic Description: ${topic.description}\n`;
      output += `Topic ID: ${topic.topic_id}\n`;
      output += `Topic is Active: ${topic.is_active}\n`;
      output += `Topic Updated At: ${topic.updated_at}\n`;
      output += "\n";
    }

    return output;
  } catch (error) {
    console.error("Error fetching Allora topics:", error);
    return "Error fetching Allora topics.";
  }
};

/**
 * Fetch inference for a given topic ID.
 * @param topicId - The ID of the topic.
 * @returns The inference data for the specified topic.
 */
export const fetchInferenceByTopicID = async (
  topicName: string,
  topicId: number
) => {
  try {
    if (!topicId || !topicName) {
      const topics = await fetchAlloraTopics();
      return `error trying to get allora prediction.\nTopics: ${topics}`;
    }
    const inferenceRes = await alloraClient.getInferenceByTopicID(topicId);

    const inferenceValue =
      inferenceRes.inference_data.network_inference_normalized;

    return `Inference provided by Allora Network on topic ${topicName} (Topic ID: ${topicId}): ${inferenceValue}`;
  } catch (error) {
    console.error(`Error fetching inference for topic ID ${topicId}:`, error);
  }
};

/**
 * Fetch asset price inference from Allora.
 * @param token - The token symbol (e.g., BTC, ETH).
 * @param timeframe - The prediction timeframe.
 * @returns The predicted price.
 */
export const fetchPriceInference = async (
  token: PriceInferenceToken,
  timeframe: PriceInferenceTimeframe
) => {
  try {
    return await alloraClient.getPriceInference(token, timeframe);
  } catch (error) {
    console.error(`Error fetching price inference for ${token}:`, error);
    throw error;
  }
};
