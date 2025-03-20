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
export const CHARITY_UPDATE = "charity:update";
export const KYBERSWAP_TOKENS_INFO = {
  BEETS: {
    symbol: "BEETS",
    name: "Beets",
    address: "0x2D0E0814E62D80056181F5cd932274405966e4f0",
    decimals: 18,
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether on Sonic",
    address: "0x50c42dEAcD8Fc9773493ED674b675bE577f2634b",
    decimals: 18,
  },
  S: {
    symbol: "S",
    name: "Sonic",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
  },
  SWPx: {
    address: "0xA04BC7140c26fc9BB1F36B1A604C7A5a88fb0E70",
    decimals: 18,
    symbol: "SWPx",
    name: "SWPx",
  },
  wS: {
    address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
    decimals: 18,
    symbol: "wS",
    name: "Wrapped Sonic",
  },
  USDC: {
    address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
    decimals: 6,
    symbol: "USDC.e",
    name: "USDC.e",
  },
};
