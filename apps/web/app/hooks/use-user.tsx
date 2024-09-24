import { useAuth0 } from "@auth0/auth0-react";

export const useUser = () => {
  const { user, isLoading, error } = useAuth0();

  if (isLoading) {
    return { isLoading: true, user: null, error: null };
  }

  if (error) {
    return { isLoading: false, user: null, error };
  }

  return { isLoading: false, user, error: null };
};
