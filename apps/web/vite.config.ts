import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import FullReload from "vite-plugin-full-reload";
import { vercelPreset } from "@vercel/remix/vite";
import dotenv from "dotenv";

dotenv.config();

const userConfig = defineConfig({
  define: {
    "process.env.PORT": JSON.stringify(process.env.PORT),
    "process.env.KBLOCKS_GROUP_NAME": JSON.stringify(process.env.KBLOCKS_GROUP_NAME),
    "process.env.KBLOCKS_NAMESPACE": JSON.stringify(process.env.KBLOCKS_NAMESPACE),
    "process.env.KBLOCKS_CONFIG_MAP_ANNOTATION": JSON.stringify(process.env.KBLOCKS_CONFIG_MAP_ANNOTATION),
    "process.env.KUBE_API_SERVER": JSON.stringify(process.env.KUBE_API_SERVER),
    "process.env.KUBE_CA_DATA": JSON.stringify(process.env.KUBE_CA_DATA),
    "process.env.KUBE_CERT_DATA": JSON.stringify(process.env.KUBE_CERT_DATA),
    "process.env.KUBE_KEY_DATA": JSON.stringify(process.env.KUBE_KEY_DATA),
    "process.env.KUBE_CLUSTER_NAME": JSON.stringify(process.env.KUBE_CLUSTER_NAME),
    "process.env.KUBE_USER_NAME": JSON.stringify(process.env.KUBE_USER_NAME),
    "process.env.KUBE_CONTEXT_NAME": JSON.stringify(process.env.KUBE_CONTEXT_NAME),
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      presets: [vercelPreset()],
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
