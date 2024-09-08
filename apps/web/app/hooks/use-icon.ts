import { Box } from "lucide-react";
import icons from "lucide-react/dynamicIconImports"
import { lazy, useEffect, useState } from "react";

export function useIcon(name: string) {
  const [Icon, setIcon] = useState<React.ElementType>(Box);

  useEffect(() => {
    const i = icons[name as keyof typeof icons];
    if (i) {
      setIcon(lazy(i))
    }
  }, [name]);

  return Icon;
}