import { SERVER_URL } from "../utils/constants";

export const callLLMApi = async ({ task }) => {
  const response = await fetch(`${SERVER_URL}/api/llm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ task }),
  });
  return await response.json();
};

export const callLLMAuditApi = async ({ contractCode }) => {
  const response = await fetch(`${SERVER_URL}/api/llm/audit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ contractCode }),
  });
  return await response.json();
};

export const callLLMTxHashApi = async ({ txHash }) => {
  const response = await fetch(`${SERVER_URL}/api/llm/tx_hash`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ txHash }),
  });
  return await response.json();
};
