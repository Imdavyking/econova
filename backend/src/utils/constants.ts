import { environment } from "./config";

export const SIGN_TWITTER_POINTS = {
  like: 100,
  retweet: 200,
  quoteTweet: 300,
};

export const FRONTEND_URL = environment.FRONTEND_URL;
export const CHAIN_ID = environment.CHAIN_ID!;
export const MULTICALL3_CONTRACT_ADDRESS =
  "0xcA11bde05977b3631167028862bE2a173976CA11";
export const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const allowedOrigins = [
  new URL(FRONTEND_URL!).origin,
  new URL("http://localhost:3000").origin,
];
export const WRAPPED_SONIC_CONTRACT_ADDRESS =
  "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38";
