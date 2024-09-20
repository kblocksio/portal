import { useCallback, useState } from "react";
import { supabase } from "~/lib/supabase.js";

export const useSignIn = () => {
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setLoading] = useState(location.hash.length > 0);
  const signIn = useCallback(async () => {
    setLoading(true);

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.append("client_id", import.meta.env.VITE_GITHUB_CLIENT_ID);
    const session = await supabase.auth.getSession();
    const access_token = session.data.session?.access_token;
    if (!access_token) {
      console.error("No access token found");
      location.assign("/");
      return;
    }
    url.searchParams.append("state", access_token);
    url.searchParams.append("redirect_uri", location.origin);

    console.log({ url });

    supabase.auth
      .signInWithOAuth({
        provider: "github",
        options: {
          // redirectTo: `${location.origin}/api/auth/installation/callback`,
          redirectTo: url.toString(),
        },
      })
      .then(({ error }) => {
        if (error) {
          setError(error);
        }
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return { signIn, error, isSigningIn: isLoading };
};
