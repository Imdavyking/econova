import { SERVER_URL } from "../utils/constants";

export const getUserTwitterInfo = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/user`, {
      credentials: "include",
      method: "GET",
      mode: "cors",
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
    });
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching user info");
  }
};
