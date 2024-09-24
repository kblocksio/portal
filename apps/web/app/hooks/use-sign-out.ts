import { useAuth0 } from "@auth0/auth0-react";

export const useSignOut = () => {
  const { logout, isLoading } = useAuth0();

  const signOut = () => {
    logout({ returnTo: window.location.origin });
  };

  return { signOut, isSigningOut: isLoading };
};
