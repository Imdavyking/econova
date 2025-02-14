export type ToolCall = {
  name: "addPoints" | "redeemPoints" | "donate";
  args: {
    weight?: number;
    points?: number;
    tokenAddress?: string;
    amountInUsd?: number;
  };
  type: "tool_call";
  id: string;
};

export type AiResponseType = {
  content: string;
  tool_calls: ToolCall[];
};

export type SolveTaskResult = {
  results: string[];
  needsMoreData: boolean;
};
