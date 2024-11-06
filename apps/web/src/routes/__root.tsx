import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/app";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRoute({
  component: () => (
    <>
      <AppLayout />
      <ScrollRestoration />
      <Suspense>
        <div className="hidden lg:visible">
          <TanStackRouterDevtools />
        </div>
      </Suspense>
    </>
  ),
});
