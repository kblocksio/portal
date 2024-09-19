import { useCallback, useState } from "react";
import { supabase } from "~/lib/supabase.js";

export const useSignIn = () => {
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setLoading] = useState(location.hash.length > 0);
  const signIn = useCallback(() => {
    setLoading(true);
    supabase.auth
      .signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: location.origin,
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
