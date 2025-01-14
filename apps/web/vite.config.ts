import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import reactPlugin from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import dotenv from "dotenv";
dotenv.config();

// These packages are big and we want to split them into their own chunks.
const bigVendors = [
  "parse5",
  "@swagger-api",
  "swagger-ui-react",
  "swagger-client",
  "highlight.js",
  "@xyflow",
  "lodash",
  "@tsparticles",
  "framer-motion",
  "refractor",
  "lucide-react",
  "@heroicons/react",
  "@tanstack",
  "@radix-ui",
  "remarkable",
  "autolinker",
  "react-syntax-highlighter",
  "zod",
  "immutable",
  "linkifyjs",
  "js-yaml",
  "dompurify",
  "tailwind-merge",
  "ramda",
  "core-js-pure",
  "micromark",
  "micromark-core-components",
  "micromark-core-commmonmark",
  "@floating-ui",
  "@trpc",
  "entities",
  "react-use-websocket",
  "short-unique-id",
];

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
  build: {
    rollupOptions: {
      output: {
        // manualChunks: {
        //   // "swagger-ui": ["swagger-ui-react"],
        //   icons: ["lucide-react", "@heroicons/react"],
        // },
        manualChunks(id) {
          for (const vendor of bigVendors) {
            if (id.includes(`/node_modules/${vendor}`)) {
              return vendor;
            }
          }

          // if (
          //   id.includes("/node_modules/lucide-react") ||
          //   id.includes("/node_modules/@heroicons/react")
          // ) {
          //   return "icons";
          // }

          if (id.includes("/node_modules/")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
