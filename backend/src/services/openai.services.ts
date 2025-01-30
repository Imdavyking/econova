import OpenAI from "openai";

export class OpenAIService {
  private openAIApiKey: string;

  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
  }

  private async openAILLM(prompt: string): Promise<string | null> {
    try {
      const openai = new OpenAI({
        apiKey: this.openAIApiKey,
        dangerouslyAllowBrowser: true,
      });

      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
      });

      return chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI LLM Error:", error);
      return null;
    }
  }

  private async promptLLM(prompt: string): Promise<string> {
    const openaiLLM = await this.openAILLM(prompt);
    return openaiLLM ? openaiLLM : "";
  }

  public async getNextAction(
    task: string,
    toolsDescription: { [key: string]: any },
    context: { [key: string]: any }
  ): Promise<{ [key: string]: any }> {
    const prompt = `
    CREATIVE_ADDR (CREATIVE): 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    ETHEREUM_ADDR (ETHEREUM): 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
    Task: ${task}
    Available tools: ${JSON.stringify(toolsDescription)}
    Current context: ${JSON.stringify(context)}
    Determine the next action to take based on the current context and available tools.
    Previous results can be referenced using {{result_X}} where X is the step number.
    Respond in JSON format as:
    {{"tool": "tool_name","args": "arguments"}}
    if task is complete, respond with:
    {{"tool": "TASK_COMPLETE","args": ""}}
    `;

    try {
      const nextAction = await this.promptLLM(prompt);
      return JSON.parse(nextAction);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return { tool: "ERROR", args: "Invalid response format", error: error };
    }
  }
}
