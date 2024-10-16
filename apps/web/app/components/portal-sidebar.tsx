import { Link, useLocation } from "@remix-run/react";
import { Button } from "./ui/button";
import { Box, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "~/lib/utils";

export function PortalSidebar() {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className="bg-muted flex w-16 min-w-16 flex-none flex-col items-center space-y-4 border-r py-4">
      <Button variant="ghost" size="icon" asChild>
        <Link
          to="/"
          className={cn(
            isActive("/") ? "text-primary rounded-lg bg-gray-200" : "",
            "hover:bg-gray-200",
          )}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="sr-only">Dashboard</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
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
      </Button>
      <Button variant="ghost" size="icon" asChild>
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
      </Button>
    </aside>
  );
}
