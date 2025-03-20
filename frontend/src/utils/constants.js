import { formatChainId } from "./formatChainId";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const SERVER_URL_TWITTER_LOGIN = `${SERVER_URL}/twitter/login`;
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const CHAIN_ID = formatChainId(import.meta.env.VITE_CHAIN_ID);
export const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME;
export const CHAIN_CURRENCY_NAME = import.meta.env.VITE_CHAIN_CURRENCY_NAME;
export const CHAIN_SYMBOL = import.meta.env.VITE_CHAIN_SYMBOL;
export const CHAIN_RPC = import.meta.env.VITE_RPC_URL;
export const CHAIN_BLOCKEXPLORER_URL = import.meta.env
  .VITE_CHAIN_BLOCKEXPLORER_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const FIAT_DECIMALS = 2;
export const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const WRAPPED_SONIC_CONTRACT_ADDRESS =
  "0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38";
export const MULTICALL3_CONTRACT_ADDRESS =
  "0xcA11bde05977b3631167028862bE2a173976CA11";
export const FAILED_KEY = "failed";
export const BMI_ADVICE = "give advice on how to improve BMI, user unhealthy";
export const GRAPH_QL_ENDPOINT = import.meta.env.VITE_GRAPH_QL_ENDPOINT;
export const WALLET_CONNECT_PROJECT_ID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID;
export const NFT_COURSE_CONTRACT_ADDRESS = import.meta.env
  .VITE_NFT_COURSE_CONTRACT_ADDRESS;
export const ECONOVA_GOVERNOR_CONTRACT_ADDRESS = import.meta.env
  .VITE_ECONOVA_GOVERNOR_CONTRACT_ADDRESS;
export const TWITTER_PROFILE_URL = `https://x.com/${
  import.meta.env.VITE_TWITTER_NAME
}`;
