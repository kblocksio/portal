import { useCallback, useState } from "react";

export const useSignOut = () => {
  const [isLoading, setLoading] = useState(location.hash.length > 0);
  const signOut = useCallback(async () => {
    setLoading(true);
    location.assign("/api/auth/sign-out");
  }, []);
  return { signOut, isSigningOut: isLoading };
};
