import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

export function usePreviousRoute() {
  const router = useRouter();
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);

  useEffect(() => {
    let lastRoute: string | null = null;

    const unsubscribe = router.subscribe("onBeforeNavigate", () => {
      const currentRoute = router.state.location.pathname;
      setPreviousRoute(lastRoute); // Update state with the last route
      lastRoute = currentRoute; // Track the current route for the next change
    });

    return () => unsubscribe();
  }, [router]);

  return previousRoute;
}
