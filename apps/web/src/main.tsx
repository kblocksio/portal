import "./styles/tailwind.css";
import "./styles/global.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { App } from "./app";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function Root() {
  return (
    <StrictMode>
      <App>
        <RouterProvider router={router} />
      </App>
    </StrictMode>
  );
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<Root />);
}
