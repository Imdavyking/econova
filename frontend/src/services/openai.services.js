import { SERVER_URL } from "../utils/constants";

export const callLLMApi = async ({ task, context, toolsDescription }) => {
  const response = await fetch(`${SERVER_URL}/api/llm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ task, context, toolsDescription }),
  });
  return await response.json();
};
