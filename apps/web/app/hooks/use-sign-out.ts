import { useCallback, useState } from "react";
import { supabase } from "~/lib/supabase.js";

export const useSignOut = () => {
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setLoading] = useState(false);
  const signOut = useCallback(() => {
    setLoading(true);
    supabase.auth
      .signOut()
      .then(({ error }) => {
        if (error) {
          setError(error);
        } else {
          location.assign("/");
        }
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return { signOut, error, isSigningOut: isLoading };
};
