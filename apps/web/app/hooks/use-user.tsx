import { createContext, PropsWithChildren, useContext } from "react";

export interface User {
  name: string;
  email: string;
}

const Context = createContext<User | undefined>(undefined);

export const useUser = () => {
  return useContext(Context);
};

export interface UserProviderProps {
  user: User | undefined;
}

export const UserProvider = (props: PropsWithChildren<UserProviderProps>) => {
  return (
    <Context.Provider value={props.user}>{props.children}</Context.Provider>
  );
};
