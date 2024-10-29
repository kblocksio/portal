import { defineConfig, optimizeDeps } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import reactPlugin from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { plugin as mdPlugin, Mode } from "vite-plugin-markdown";

export default defineConfig(({ mode }) => ({
  plugins: [
    TanStackRouterVite(),
    reactPlugin(),
    tsconfigPaths(),
    mdPlugin({
      mode: [Mode.HTML, Mode.MARKDOWN],
    }),
  ],
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
