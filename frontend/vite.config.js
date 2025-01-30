import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext", // you can also use 'es2020' here
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext", // you can also use 'es2020' here
    },
  },
  target: "es2020",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
