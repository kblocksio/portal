import { useCallback, useState } from "react";

export const useSignIn = () => {
  const [isLoading, setLoading] = useState(location.hash.length > 0);
  const signIn = useCallback(async () => {
    setLoading(true);
    location.assign("/api/auth/sign-in");
  }, []);
  return { signIn, isSigningIn: isLoading };
};
