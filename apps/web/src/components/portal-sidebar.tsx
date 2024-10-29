import { useLocation, Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import {
  ChartNoAxesGantt,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/app-context";

export function PortalSidebar() {
  const { pathname } = useLocation();
  const { selectedProject } = useAppContext();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className="flex flex-none flex-col items-center space-y-4 py-4">
      <Button variant="ghost" size="icon" asChild>
        <Link
          to="/"
          className={cn(
            isActive("/") ? "text-primary rounded-lg bg-gray-200" : "",
            "hover:bg-gray-200",
          )}
        >
          <Home className="h-6 w-6" />
          <span className="sr-only">Dashboard</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link
          to={`/project/${selectedProject?.value ?? "all"}`}
          className={cn(
            isActive(`/project/${selectedProject?.value ?? "all"}`)
              ? "text-primary rounded-lg bg-gray-200"
              : "",
            "hover:bg-gray-200",
          )}
        >
          <ChartNoAxesGantt className="h-6 w-6" />
          <span className="sr-only">Dashboard</span>
        </Link>
      </Button>
      {/* <Button variant="ghost" size="icon" asChild>
        <Link
          to="/catalog"
          className={cn(
            isActive("/catalog") ? "text-primary rounded-lg bg-gray-200" : "",
            "hover:bg-gray-200",
          )}
        >
          <Box className="h-6 w-6" />
          <span className="sr-only">Catalog</span>
        </Link>
      </Button> */}
      {/* <Button variant="ghost" size="icon" asChild>
        <Link
          to="/admin"
          className={cn(
            isActive("/admin") ? "text-primary rounded-lg bg-gray-200" : "",
            "hover:bg-gray-200",
          )}
        >
          <Settings className="h-6 w-6" />
          <span className="sr-only">Admin</span>
        </Link>
      </Button> */}
    </aside>
  );
}
