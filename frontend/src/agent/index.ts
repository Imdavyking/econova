/** @format */

import { callLLMApi } from "../services/openai.services";
import {
  addPointService,
  donateToFoundationService,
  redeemCodeService,
} from "../services/blockchain.services";
import { AiResponseType, ToolCall } from "../types";

export class AIAgent {
  tools: { [key: string]: Function };
  toolsInfo: { [key: string]: string };

  constructor() {
    this.tools = {
      donate: donateToFoundationService,
      redeemCode: redeemCodeService,
      addPoints: addPointService,
    };
    this.toolsInfo = {
      donate: "Make a donation in USD (paid using native token).",
      redeemCode: "Redeem points for rewards.",
      addPoints: "Add points (measured in grams) to your account.",
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
