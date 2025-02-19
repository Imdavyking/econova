/** @format */

import { callLLMApi } from "../services/openai.services";
import {
  deployTokenService,
  donateToFoundationService,
  redeemPointsService,
  adviceOnHealthService,
  sendSonicService,
  sendERC20TokenService,
  wrapSonicService,
  unwrapSonicService,
} from "../services/blockchain.services";
import { AiResponseType, SolveTaskResult, ToolCall } from "../types";
import { charityCategories } from "../utils/charity.categories";
import { bridgeCoin } from "../services/debridge.services";

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
      sendERC20Token: sendERC20TokenService,
      wrapSonic: wrapSonicService,
      unwrapSonic: unwrapSonicService,
      bridge: bridgeCoin,
      alloraPredict: async (topicId: number, topicName: string) => {
        const urlParams = new URLSearchParams();
        if (topicId) {
          urlParams.append("topicId", `${topicId}`);
        }
        if (topicName) {
          urlParams.append("topicName", topicName);
        }
        const url = `/api/allora/price-inference?${urlParams.toString()}`;
        const response = await fetch(url);
        return response.json();
      },
    };
    this.toolsInfo = {
      donate: `Example: Donate 100 USD to a cause. e.g ${Object.keys(
        charityCategories
      ).join(", ")}`,
      redeemPoints: "Example: Redeem 5 reward points",
      deployToken:
        "Example: Deploy a token named 'Token' with symbol 'TKN' and an initial supply of 1,000",
      sendSonic:
        "Example: Send 10 SONIC to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
      sendERC20Token:
        "Example: Send 10 wSonic to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
      wrapSonic: "Example: Wrap 10 SONIC",
      unwrapSonic: "Example: Unwrap 10 wrappedSonic",
      bridge:
        "Only Mainnet Bridges are Supported: Example - Bridge 10 SONIC to BSC",
    };
  }

  private async executeAction(action: ToolCall) {
    const tool = this.tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }
    return tool.bind(this)(action.args ? action.args : {});
  }

  public async solveTask(task: string): Promise<SolveTaskResult> {
    const action = (await callLLMApi({
      task,
    })) as AiResponseType;

    const results: string[] = [];

    // TODO: fix for multiple args (like user need more details)
    if (action.tool_calls.length === 0 && action.content.trim() !== "") {
      results.push(action.content);
    }
    for (const toolCall of action.tool_calls) {
      const result = await this.executeAction(toolCall);
      results.push(result);
    }

    return {
      results,
      needsMoreData: action.content.trim() !== "",
    };
  }
}
