import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/css/app.css";
import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apollo.services";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { defineChain } from "viem";
import {
  CHAIN_BLOCKEXPLORER_URL,
  CHAIN_CURRENCY_NAME,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
  CHAIN_SYMBOL,
  WALLET_CONNECT_PROJECT_ID,
} from "./utils/constants";

export const chainInfo = defineChain({
  id: Number(CHAIN_ID),
  name: CHAIN_NAME,
  nativeCurrency: {
    decimals: 18,
    name: CHAIN_CURRENCY_NAME,
    symbol: CHAIN_SYMBOL,
  },
  rpcUrls: {
    default: { http: [CHAIN_RPC] },
  },
  blockExplorers: {
    default: {
      name: "Testnet Explorer",
      url: CHAIN_BLOCKEXPLORER_URL,
    },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: "EcoNova",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [chainInfo],
});
const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ApolloProvider>
);
