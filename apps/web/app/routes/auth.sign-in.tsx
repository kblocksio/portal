import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SignInError } from "~/components/sign-in-error.jsx";
import { createServerSupabase } from "~/lib/supabase.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);

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
