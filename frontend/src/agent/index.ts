/** @format */

import { callLLMApi } from "../services/openai.services";
import {
  addPointService,
  deployTokenService,
  donateToFoundationService,
  redeemPointsService,
} from "../services/blockchain.services";
import { AiResponseType, ToolCall } from "../types";

export class AIAgent {
  tools: { [key: string]: Function };
  toolsInfo: { [key: string]: string };

  constructor() {
    this.tools = {
      donate: donateToFoundationService,
      redeemPoints: redeemPointsService,
      addPoints: addPointService,
      deployToken: deployTokenService,
    };
    this.toolsInfo = {
      donate: "Example: Donate 100 USD to a cause.",
      redeemPoints: "Example: Redeem 5 reward points.",
      addPoints: "Example: Add 152 points to your balance.",
      deployToken:
        "Example: Deploy a token named 'Token' with symbol 'TKN' and an initial supply of 1,000.",
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
    for (const toolCall of action.tool_calls) {
      const result = await this.executeAction(toolCall);
      results.push(result);
    }

    return results;
  }
}
