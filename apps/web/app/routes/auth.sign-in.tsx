import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { SignInError } from "~/components/sign-in-error.jsx";

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
    return json(
      {
        status: error.status,
        code: error.code,
        name: error.name,
        message: error.message,
      },
      { status: 500 },
    );
  }

  return redirect(data.url, { headers });
}

export default function AuthSignIn() {
  const error = useLoaderData<typeof loader>();

  return (
    <SignInError
      status={error.status}
      code={error.code}
      name={error.name}
      message={error.message}
    />
  );
}
