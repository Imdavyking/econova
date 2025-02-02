import { SERVER_URL } from "../utils/constants";

export const getUserTwitterInfo = async () => {
  const response = await fetch(`${SERVER_URL}/api/user`, {
    // credentials: "include",
    method: "GET",
  });
  return await response.json();
};
