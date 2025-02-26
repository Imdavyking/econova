import { SERVER_URL } from "../utils/constants";

export const getVerifiedSourceCode = async ({ contractAddress }) => {
  const response = await fetch(`${SERVER_URL}/api/source-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ contractAddress }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch source code");
  }
  return await response.json();
};
