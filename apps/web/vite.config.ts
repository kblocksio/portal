import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import FullReload from "vite-plugin-full-reload";

const userConfig = defineConfig({
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ["lucide-react"],
  },
  ssr: {
    noExternal: ["lucide-react"],
  },
  server: {
    watch: {
      // Use this option to specify which files to watch and trigger reloads
      usePolling: true, // Enables polling mode, useful for environments where filesystem events don't work well
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  if (!userConfig.server) userConfig.server = {};
  userConfig.server.hmr = {
    port: 8002,
    overlay: true,
  };
  if (!userConfig.plugins) userConfig.plugins = [];
  userConfig.plugins.push(FullReload(["**/*.tsx", "**/*.css", "**/*.json"]));
}

export default userConfig;
