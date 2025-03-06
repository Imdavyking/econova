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
  if (!response.ok) {
    throw new Error("Failed to fetch contract audit");
  }
  return await response.json();
};

export const callLLMTxHashApi = async ({ txInfo }) => {
  const response = await fetch(`${SERVER_URL}/api/llm/tx_hash`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ txInfo }, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    ),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch transaction analysis");
  }
  return await response.json();
};

export const callDaoAnalysisApi = async (proposal) => {
  const response = await fetch(`${SERVER_URL}/api/llm/dao_analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(proposal, (_, v) =>
      typeof v === "bigint" ? v.toString() : v
    ),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch transaction analysis");
  }
  return await response.json();
};
