import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import reactPlugin from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => ({
  plugins: [TanStackRouterVite(), reactPlugin(), tsconfigPaths()],
  assetsInclude: ["**/*.md"],
  optimizeDeps: {
    include: ["lucide-react"],
  },
  ssr: {
    noExternal: ["lucide-react"],
  },
  server:
    mode === "development"
      ? {
          proxy: {
            "/api": {
              target: "https://kblocks.io",
            },
          },
        }
      : undefined,
}));
