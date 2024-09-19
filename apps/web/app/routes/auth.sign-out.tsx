import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { createServerSupabase } from "~/lib/supabase.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createServerSupabase(request);

  await supabase.auth.signOut();

  return redirect("/", { headers });
}
