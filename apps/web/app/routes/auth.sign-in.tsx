import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card.jsx";

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            ),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: process.env.SUPABASE_REDIRECT_URL,
    },
  });

  if (error) {
    return json({ error }, { status: 500 });
  }

  return redirect(data.url, { headers });
}

export default function Component() {
  const { error } = useLoaderData<typeof loader>();

  const tryAgain = () => {
    location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-destructive h-6 w-6" />
            <CardTitle className="text-destructive text-2xl font-bold">
              Sign In Error
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.status && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Status
              </span>
              <span className="text-lg font-bold">{error.status}</span>
            </div>
          )}
          {error.code && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Code
              </span>
              <span className="bg-muted rounded px-2 py-1 font-mono text-lg">
                {error.code}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">
              Name
            </span>
            <span className="text-lg">{error.name}</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-sm font-medium">
              Message
            </span>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="default" onClick={tryAgain}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
