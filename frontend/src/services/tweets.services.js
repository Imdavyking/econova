import { SERVER_URL } from "../utils/constants";

export const getAllTweets = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/tweets`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching user info");
  }
};
