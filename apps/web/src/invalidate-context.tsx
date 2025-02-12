import { createContext, ReactNode, useContext, useEffect } from "react";
import Emittery from "emittery";

type InvalidateEmittery = Emittery<{
  invalidate: undefined;
}>;

const InvalidateContext = createContext<{
  emitter: InvalidateEmittery;
}>({
  emitter: new Emittery(),
});

export const useInvalidate = (callback: () => void) => {
  const { emitter } = useContext(InvalidateContext);
  useEffect(() => {
    emitter.on("invalidate", callback);
    return () => {
      emitter.off("invalidate", callback);
    };
  }, [emitter, callback]);
};

export const InvalidateProvider: React.FC<{
  emitter: InvalidateEmittery;
  children: ReactNode;
}> = ({ emitter, children }) => {
  return (
    <InvalidateContext.Provider
      value={{
        emitter,
      }}
    >
      {children}
    </InvalidateContext.Provider>
  );
};
