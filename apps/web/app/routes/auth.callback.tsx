import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import { SignInError } from "~/components/sign-in-error.jsx";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";
  const headers = new Headers();

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

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

    return redirect(next, { headers });
  }

  return json(
    {
      status: undefined,
      code: undefined,
      name: "Bad Request",
      message: "Missing code parameter",
    },
    { status: 400 },
  );
}

export default function AuthCallback() {
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
