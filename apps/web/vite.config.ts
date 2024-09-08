import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    hmr: {
      port: 8002, // Ensure the correct port is set for HMR
    },
  },
  build: {
    ssr: "node",
  },
  ssr: {
    noExternal: ["lucide-react"], // Mark it as external so Vite transpiles it
  },
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
});
