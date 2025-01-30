import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/css/app.css";
import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { creatorTestnet } from "wagmi/chains";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apollo.services"; // Import the client
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
const config = getDefaultConfig({
  appName: "EcoNova",
  projectId: "YOUR_PROJECT_ID",
  chains: [creatorTestnet],
});
const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={false ? darkTheme() : lightTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ApolloProvider>
);
