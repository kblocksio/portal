import { AppProvider } from "./app-context";
import { UserProvider } from "./hooks/use-user";
import { CreateResourceProvider } from "./create-resource-context.js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./components/app-sidebar.js";
import { AppBreadcrumbs } from "./components/app-breadcrumbs.js";
import { AppToaster } from "./components/app-toaster.js";
import { NotificationMenu } from "./components/notifications-menu.js";
import { NotificationsProvider } from "./notifications-context.js";
import { Outlet } from "@tanstack/react-router";
import { ErrorBoundary } from "react-error-boundary";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AlertCircle } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpLink, splitLink } from "@trpc/client";
import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "./trpc";
import { ScrollAreaResizeObserver } from "./components/scroll-area-resize-observer.js";
import { LocationProvider } from "./location-context.js";
import { throttle } from "lodash-es";
import useWebSocket from "react-use-websocket";
import type { WorkerEvent } from "@kblocks/api";
import Emittery from "emittery";
import { InvalidateProvider } from "./invalidate-context.js";

const TRPC_URL = `${location.origin}/api/trpc`;

const WS_PROTOCOL = location.protocol === "https:" ? "wss:" : "ws:";
const WS_URL =
  import.meta.env.VITE_WS_URL ?? `${WS_PROTOCOL}//${location.host}/api/events`;

export function App({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.path === "listEvents";
          },
          false: httpLink({
            url: TRPC_URL,
          }),
          true: httpBatchLink({
            url: TRPC_URL,
          }),
        }),
      ],
    }),
  );

  const [emitter] = useState(
    () =>
      new Emittery<{
        invalidate: undefined;
      }>(),
  );

  // Invalidate queries on every message, but throttle the calls to avoid too many requests.
  const invalidateQueries = useCallback(
    // eslint-disable-next-line react-compiler/react-compiler
    throttle(
      () => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            return (
              Array.isArray(query.queryKey[0]) &&
              query.queryKey[0][0] !== "listEvents"
            );
          },
        });
        emitter.emit("invalidate");
      },
      2000,
      { leading: true, trailing: true },
    ),
    [queryClient],
  );

  const { getWebSocket } = useWebSocket<WorkerEvent>(WS_URL, {
    shouldReconnect() {
      if (import.meta.env.DEV) {
        setTimeout(() => {
          invalidateQueries();
        }, 500);
      }
      return true;
    },
    onMessage() {
      invalidateQueries();
    },
  });

  // make sure to close the websocket when the component is unmounted
  useEffect(() => {
    return () => {
      const websocket = getWebSocket();
      if (websocket) {
        websocket.close();
      }
    };
  }, [getWebSocket]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <InvalidateProvider emitter={emitter}>
          <AppProvider>
            <UserProvider>
              <NotificationsProvider>
                <CreateResourceProvider>{children}</CreateResourceProvider>
              </NotificationsProvider>
            </UserProvider>
          </AppProvider>
        </InvalidateProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// Create a new Layout component that contains your app shell
export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex grow flex-col">
          <header className="bg-background/80 sticky top-0 z-10 flex h-16 w-full items-center self-start border-b backdrop-blur transition-[height] duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center gap-2 px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <AppBreadcrumbs />
              </div>
              <NotificationMenu className="ml-auto" />
            </div>
          </header>
          <ScrollAreaResizeObserver>
            <main className="grow px-4 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-screen-2xl py-4">
                <ErrorBoundary
                  fallbackRender={(props) => (
                    <div className="pt-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Unexpected Error</AlertTitle>
                        <AlertDescription>
                          {props.error instanceof Error
                            ? props.error.message
                            : "An unexpected error occurred"}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                >
                  <LocationProvider>
                    <Outlet />
                  </LocationProvider>
                </ErrorBoundary>
              </div>
            </main>
          </ScrollAreaResizeObserver>
        </div>
      </SidebarProvider>
      <AppToaster />
    </div>
  );
}
