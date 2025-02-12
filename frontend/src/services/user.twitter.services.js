import { SERVER_URL } from "../utils/constants";
import { getTwitterAuth } from "./twitter.auth.services";

export const getUserTwitterInfo = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/user`, {
      credentials: "include",
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTwitterAuth()}`,
      },
    });
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching user info");
  }
};

export const userLogout = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/user/logout`, {
      credentials: "include",
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTwitterAuth()}`,
      },
    });
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching user info");
  }
};
