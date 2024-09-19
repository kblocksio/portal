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
import { UserProvider } from "./hooks/use-user.js";
import { GithubIcon, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card.js";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();

  const { supabase } = createServerSupabase(request, headers);

  const user = await supabase.auth.getUser();

  return json(
    {
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
  const { user } = useLoaderData<typeof loader>();
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
          <UserProvider user={user}>
            {user && (
              <div className="flex h-screen flex-col">
                <Header />
                <div className="flex-grow overflow-hidden">
                  <Outlet />
                </div>
              </div>
            )}
            {!user && <SignIn />}
          </UserProvider>
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubSignIn = () => {
    setIsLoading(true);
    location.assign("/auth/sign-in");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Use your GitHub account to access the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-500">
              We use GitHub for authentication to provide a secure and seamless
              sign-in experience. Click the button below to continue with
              GitHub.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleGitHubSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <GithubIcon className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
