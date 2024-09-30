import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { Header } from "~/components/header";
import { cn } from "~/lib/utils";
import { AppProvider } from "~/AppContext";
import "./styles/global.css";
import { UserProvider } from "./hooks/use-user.js";
import { PortalSidebar } from "./components/portal-sidebar";
import { ResourceProvider } from "./ResourceContext";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/wing.svg" />
        <Meta />
        <Links />
      </head>
      <body className={cn("font-inter overflow-hidden")}>
        <AppProvider>
          <UserProvider>
            <ResourceProvider>
              <div className="flex h-screen flex-col">
                <Header />
                <div className="flex h-[calc(100vh-theme(height.14))] bg-background">
                  <PortalSidebar />
                  <div className="flex-grow overflow-hidden">
                    <Outlet />
                  </div>
                </div>
              </div>
            </ResourceProvider>
          </UserProvider>
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
