import { SERVER_URL } from "../utils/constants";

export const getAllTweets = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/tweets`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch tweets");
    }
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching user info");
  }
};

export const getPaginatedTweets = async (page) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/tweets/page/${page}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch tweets");
    }
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching user info");
  }
};
