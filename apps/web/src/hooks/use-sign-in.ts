import { useCallback, useState } from "react";
import { signInUrl } from "@/lib/backend";

export const useSignIn = () => {
  const [isLoading, setLoading] = useState(location.hash.length > 0);
  const signIn = useCallback(async () => {
    setLoading(true);
    location.assign(signInUrl);
  }, []);
  return { signIn, isSigningIn: isLoading };
};
