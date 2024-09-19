import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SignInError } from "~/components/sign-in-error.jsx";
import { createServerSupabase } from "~/lib/supabase.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const { supabase, headers } = createServerSupabase(request);

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
