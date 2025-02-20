import { FAILED_KEY, SERVER_URL } from "../utils/constants";
export const alloraPredictService = async ({ topicId, topicName }) => {
  try {
    const urlParams = new URLSearchParams();
    if (topicId) {
      urlParams.append("topicId", `${topicId}`);
    }
    if (topicName) {
      urlParams.append("topicName", topicName);
    }
    const url = `${SERVER_URL}/api/allora/price-inference?${urlParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
  } catch (error) {
    return `${FAILED_KEY}: ${error.message}`;
  }
};
