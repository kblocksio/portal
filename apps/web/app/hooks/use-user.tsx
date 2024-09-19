import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { SignIn } from "~/components/sign-in.jsx";
import { supabase } from "~/lib/supabase.js";

const Context = createContext<User | undefined>(undefined);

export const useUser = () => {
  const user = useContext(Context);
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
    setLoading(true);
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          setError(error);
        } else {
          setUser(data.session?.user);
        }
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
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
      {error && <div>error: {error.message}</div>}
      {!isLoading && !error && !user && <SignIn />}
      {user && (
        <Context.Provider value={user}>{props.children}</Context.Provider>
      )}
    </>
  );
};
