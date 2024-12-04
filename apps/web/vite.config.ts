import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import reactPlugin from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig(({ mode }) => ({
  plugins: [TanStackRouterVite(), reactPlugin(), tsconfigPaths()],
  assetsInclude: ["**/*.md"],
  optimizeDeps: {
    include: ["lucide-react"],
  },
  ssr: {
    noExternal: ["lucide-react"],
  },
  server: {
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: process.env.VITE_BACKEND_URL,
              changeOrigin: true,
            },
          }
        : undefined,
  },
}));
