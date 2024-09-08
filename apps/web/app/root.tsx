import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
} from "@remix-run/react";
import "./tailwind.css";
import { Header } from "~/components/header";
import { cn } from "~/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sidebar } from "~/components/sidebar";
export function Layout() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("overflow-hidden")}>
        <div className="flex h-screen flex-col">
          <Header />
          <div className="flex-grow overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={14} minSize={14} collapsible>
                <div className="h-full overflow-y-auto">
                  <div className="p-2">
                    <Sidebar />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={86}>
                <div className="h-full overflow-y-auto">
                  <Outlet /> {/* Renders the routed page content */}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === "development" && <LiveReload />}
        </div>
      </body>
    </html>
  );
}

export default function App() {
  return <Layout />;
}
