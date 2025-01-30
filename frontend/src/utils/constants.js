export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
let chain_id = import.meta.env.VITE_CHAIN_ID;

chain_id = Number(+chain_id).toString(16);
if (!String(chain_id).startsWith("0x")) {
  chain_id = "0x" + chain_id;
}
export const CHAIN_ID = chain_id;
export const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME;
export const CHAIN_CURRENCY_NAME = import.meta.env.VITE_CHAIN_CURRENCY_NAME;
export const CHAIN_SYMBOL = import.meta.env.VITE_CHAIN_SYMBOL;
export const CHAIN_RPC = import.meta.env.VITE_CHAIN_RPC;
export const CHAIN_BLOCKEXPLORER_URL = import.meta.env
  .VITE_CHAIN_BLOCKEXPLORER_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const FIAT_DECIMALS = 2;
export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const FAILED_KEY = "failed";
