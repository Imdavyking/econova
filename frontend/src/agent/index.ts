/** @format */

import { callLLMApi } from "../services/openai.services";
import {
  deployTokenService,
  donateToFoundationService,
  redeemPointsService,
  adviceOnHealthService,
  sendSonicService,
} from "../services/blockchain.services";
import { AiResponseType, ToolCall } from "../types";
import { charityCategories } from "../utils/charity.categories";

export class AIAgent {
  tools: { [key: string]: Function };
  toolsInfo: { [key: string]: string };

  constructor() {
    this.tools = {
      donate: donateToFoundationService,
      redeemPoints: redeemPointsService,
      deployToken: deployTokenService,
      adviceOnHealth: adviceOnHealthService,
      sendSonic: sendSonicService,
    };
    this.toolsInfo = {
      donate: `Example: Donate 100 USD to a cause. e.g ${Object.keys(
        charityCategories
      ).join(", ")}`,
      redeemPoints: "Example: Redeem 5 reward points",
      deployToken:
        "Example: Deploy a token named 'Token' with symbol 'TKN' and an initial supply of 1,000",
      adviceOnHealth: "Example: Advice on how to improve my health",
      sendSonic:
        "Example: Send 10 SONIC to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
    };
  }

  private async executeAction(action: ToolCall) {
    const tool = this.tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }
    return tool.bind(this)(action.args ? action.args : {});
  }

  public async solveTask(task: string): Promise<string[]> {
    const action = (await callLLMApi({
      task,
    })) as AiResponseType;

    const results: string[] = [];

    if (action.tool_calls.length === 0 && action.content.trim() !== "") {
      results.push(action.content);
    }
    for (const toolCall of action.tool_calls) {
      const result = await this.executeAction(toolCall);
      results.push(result);
    }

    return results;
  }
}
