import { createRoot } from "react-dom/client";
import App from "./App";
import "./assets/css/app.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { creatorTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const config = getDefaultConfig({
  appName: "EcoNova",
  projectId: "YOUR_PROJECT_ID",
  chains: [creatorTestnet],
});
const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <App />
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
