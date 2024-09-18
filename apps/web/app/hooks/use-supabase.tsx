import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext } from "react";

const SupabaseContext = createContext<
  SupabaseClient<any, "public", any> | undefined
>(undefined);

export const useSupabase = () => {
  const supabase = useContext(SupabaseContext);
  if (!supabase) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return supabase;
};

export interface SupabaseProviderProps {
  supabase: SupabaseClient<any, "public", any>;
}

export const SupabaseProvider = (
  props: PropsWithChildren<SupabaseProviderProps>,
) => {
  return (
    <SupabaseContext.Provider value={props.supabase}>
      {props.children}
    </SupabaseContext.Provider>
  );
};
