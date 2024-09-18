import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import "./tailwind.css";
import { Header } from "~/components/header";
import { cn } from "~/lib/utils";
import { AppProvider } from "~/AppContext";
import "./styles/global.css";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { createServerSupabase } from "./lib/supabase.js";
import { SupabaseProvider } from "./hooks/use-supabase.js";
import { UserProvider } from "./hooks/use-user.js";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();

  const { supabase } = createServerSupabase(request, headers);

  const user = await supabase.auth.getUser();

  return json(
    {
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
      },
      user: user.data.user
        ? {
            name: user.data.user.user_metadata.full_name as string,
            email: user.data.user.user_metadata.email as string,
          }
        : undefined,
    },
    { headers },
  );
};

export default function App() {
  const { env, user } = useLoaderData<typeof loader>();
  const [supabase] = useState(() =>
    createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
  );
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={cn("font-inter overflow-hidden")}>
        <AppProvider>
          <SupabaseProvider supabase={supabase}>
            <UserProvider user={user}>
              <div className="flex h-screen flex-col">
                <Header />
                <div className="flex-grow overflow-hidden">
                  <Outlet />
                </div>
              </div>
            </UserProvider>
          </SupabaseProvider>
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
