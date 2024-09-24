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
import { Auth0Provider } from "@auth0/auth0-react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("font-inter overflow-hidden")}>
        <Auth0Provider
          domain={process.env.AUTH0_DOMAIN!}
          clientId={process.env.AUTH0_CLIENT_ID!}
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: process.env.AUTH0_AUDIENCE,
          }}
        >
          <AppProvider>
            <div className="flex h-screen flex-col">
              <Header />
              <div className="flex-grow overflow-hidden">
                <Outlet />
              </div>
            </div>
          </AppProvider>
        </Auth0Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
