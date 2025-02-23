import logger from "../config/logger";
import { oauth } from "../services/oauth.twitter.services";
// import { environment } from "./config";
export function setup_HandleError(error: unknown, context: string): void {
  if (error instanceof Error) {
    if (error.message.includes("net::ERR_ABORTED")) {
      logger.error(`ABORTION error occurred in ${context}: ${error.message}`);
    } else {
      logger.error(`Error in ${context}: ${error.message}`);
    }
  } else {
    logger.error(`An unknown error occurred in ${context}: ${error}`);
  }
}

/**
 * Calculate the time remaining until the rate limit resets
 * @param resetTimestamp
 * @returns Time remaining in seconds until the rate limit resets
 */
const getRateLimitResetTime = (resetTimestamp: number): number => {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  return resetTimestamp - currentTimestamp; // Time remaining in seconds
};

/**
 * Extract the message from the error if the status is 429 (Rate Limit Exceeded)
 * @param error
 * @param defaultMessage
 * @returns message extracted from the error or the default message
 */
export const extractMessageFrom429 = (
  error: any,
  defaultMessage: string
): { isLimitError: boolean; message: string } => {
  if (error.response && error.response.status === 429) {
    // If the status is 429 (Rate Limit Exceeded)
    const resetTimestamp = error.response.headers["x-rate-limit-reset"];

    // Calculate remaining time to reset the rate limit
    const remainingTime = getRateLimitResetTime(parseInt(resetTimestamp));
    const message = `Rate limit exceeded. Try again in ${remainingTime} seconds.`;
    logger.info(message);
    return { isLimitError: true, message };
  }
  return { isLimitError: false, message: defaultMessage };
};

