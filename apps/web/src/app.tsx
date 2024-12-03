import { AppProvider } from "./app-context";
import { UserProvider } from "./hooks/use-user";
import { ResourceProvider } from "./resource-context.js";
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
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import { trpc } from "./trpc";
import { ScrollAreaResizeObserver } from "./components/scroll-area-resize-observer.js";
import { LocationProvider } from "./location-context.js";

export function App({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${import.meta.env.VITE_BACKEND_URL}/trpc`,
          // You can pass any HTTP headers you wish here
          // async headers() {
          //   return {
          //     authorization: getAuthCookie(),
          //   };
          // },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <UserProvider>
            <NotificationsProvider>
              <ResourceProvider>
                <CreateResourceProvider>{children}</CreateResourceProvider>
              </ResourceProvider>
            </NotificationsProvider>
          </UserProvider>
        </AppProvider>
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
