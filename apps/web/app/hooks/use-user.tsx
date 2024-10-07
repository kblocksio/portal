import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { SignIn } from "~/components/sign-in.jsx";
import { getUser, rejectUser } from "~/lib/backend";
import { isUserWhitelisted } from "./whitelist";

const MockUser = {
  id: '1',
  user_metadata: {
    email: 'test@test.com',
    name: 'Test User',
  },
  app_metadata: {},
  aud: 'test',
  created_at: new Date().toISOString(),
};

const Context = createContext<User | undefined>(undefined);

export const useUser = () => {
  const user = useContext(Context);

  if (import.meta.env.VITE_SKIP_AUTH) {
    return MockUser;
  }

  if (user === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return user;
};

export const UserProvider = (props: PropsWithChildren) => {
  const [user, setUser] = useState<User | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {

    if (import.meta.env.VITE_SKIP_AUTH) {
      setUser(MockUser);
      setLoading(false);
      return;
    }

    setLoading(true);

    async function fetchUser() {
      try {
        const response = await getUser();
        const isWhitelisted = isUserWhitelisted(response?.user?.email);
        if (!isWhitelisted) {
          await rejectUser();
          throw new Error("User is not whitelisted and was signed out");
        }
        setUser(response.user);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <>
      {isLoading && (
        <div className="bg-background flex min-h-screen flex-col items-center justify-center">
          <Loader2 className="text-primary h-16 w-16 animate-spin" />
          <h2 className="text-foreground mt-4 text-2xl font-semibold">
            Loading
          </h2>
          <p className="text-muted-foreground mt-2">
            Checking authentication status...
          </p>
        </div>
      )}
      {error && <ErrorPage />}
      {!isLoading && !error && !user && <SignIn />}
      {user && (
        <Context.Provider value={user}>{props.children}</Context.Provider>
      )}
    </>
  );
};

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <img
          src="/wing.svg"
          alt="Wing Logo"
          width={251}
          height={153}
        />
        <h1 className="mt-8 text-4xl font-bold text-gray-900">Coming Soon...</h1>
        <p className="mt-4 text-xl text-gray-600">
          We're working on something exciting. Please check back later.
        </p>
      </div>
    </div>
  )
}
