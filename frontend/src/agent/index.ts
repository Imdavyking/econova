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

  private async executeAction(
    action: { [key: string]: any },
    context: { [key: string]: any }
  ) {
    if (action["tool"] == "TASK_COMPLETE") {
      return "Task completed";
    }
    const tool = this.tools[action["tool"]];
    if (!tool) {
      return `Tool ${action["tool"]} not found`;
    }
    let args = action["args"];
    if (typeof args == "string") {
      // replace context variables in args
      for (const key in context) {
        args = args.replace(`{{${key}}}`, context[key].toString());
      }
    }
    return tool.bind(this)(args);
  }

  public async solveTask(task: string): Promise<string[]> {
    const context: { [key: string]: any } = {};
    const results: string[] = [];

    let step = 0;

    while (true) {
      const action = await callLLMApi({
        task,
        context,
        toolsDescription: this.toolsDescription,
      });
      if (action["tool"] == "TASK_COMPLETE" || action["tool"] == "ERROR") {
        break;
      }

      if (!action["tool"]) {
        console.log("No tool provided");
        break;
      }

      const result = await this.executeAction(action, context);
      console.log(`Result: ${JSON.stringify(result)}`);
      step += 1;
      context[`result_${step}`] = result;
      results.push(result);
    }
    return results;
  }
}
