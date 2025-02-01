/** @format */

import { callLLMApi } from "../services/openai.services";
import {
  addPointService,
  donateToFoundationService,
  redeemCodeService,
} from "../services/blockchain.services";

export class AIAgent {
  tools: { [key: string]: Function };
  toolsDescription: { [key: string]: string };
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
    this.toolsDescription = {
      donate:
        "arguments: tokenAddress (string), amountInUsd (number or string); donates the specified USD value in tokens to the foundation",
      redeemCode:
        "arguments: points (number or string); redeems points for a code",
      addPoints:
        "arguments: weight (number or string); adds points to the user based on weight",
    };
  }

  // private async executeAction(
  //   action: { [key: string]: any },
  //   context: { [key: string]: any }
  // ) {
  //   if (action["tool"] == "TASK_COMPLETE") {
  //     return "Task completed";
  //   }
  //   const tool = this.tools[action["tool"]];
  //   if (!tool) {
  //     return `Tool ${action["tool"]} not found`;
  //   }
  //   let args = action["args"];
  //   if (typeof args == "string") {
  //     // replace context variables in args
  //     for (const key in context) {
  //       args = args.replace(`{{${key}}}`, context[key].toString());
  //     }
  //   }
  //   return tool.bind(this)(args);
  // }

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
    })) as ResponseType;

    const results: string[] = [];
    for (const toolCall of action.tool_calls) {
      const result = await this.executeAction(toolCall);
      results.push(result);
    }

    return results;
  }
}

type ToolCall = {
  name: "addPoints" | "redeemCode" | "donate";
  args: {
    weight?: number;
    points?: number;
    tokenAddress?: string;
    amountInUsd?: number;
  };
  type: "tool_call";
  id: string;
};

type ResponseType = {
  content: string;
  tool_calls: ToolCall[];
};
