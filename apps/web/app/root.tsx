import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sidebar } from "~/components/sidebar";
import { Header } from "~/components/header";
import { cn } from "~/lib/utils";

export default function App() {
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
              <ResizablePanel defaultSize={20} minSize={20} collapsible>
                <div className="h-full overflow-y-auto">
                  <div className="p-2">
                    <Sidebar />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={80}>
                <div className="h-full overflow-y-auto">
                  <Outlet />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <ScrollRestoration />
          <Scripts />
        </div>
      </body>
    </html>
  );
}
