import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import FullReload from "vite-plugin-full-reload";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    FullReload(["**/*.tsx", "**/*.css", "**/*.json"]), // List of files to watch for full reload
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
    hmr: {
      port: 8002,
      // Adjust paths as needed based on your project structure
      overlay: true,
    },
  },
});
