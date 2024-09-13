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
        <AppProvider>
          <div className="flex h-screen flex-col">
            <Header />
            <div className="flex-grow overflow-hidden">
              <Outlet />
            </div>
            <ScrollRestoration />
            <Scripts />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
