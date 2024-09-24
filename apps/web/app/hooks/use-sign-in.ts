
import { useAuth0 } from "@auth0/auth0-react";

export const useSignIn = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const signIn = () => {
    loginWithRedirect();
  };

  return { signIn, isSigningIn: isLoading };
};
