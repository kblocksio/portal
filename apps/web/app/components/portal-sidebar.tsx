import { Link, useLocation } from "@remix-run/react"
import { Button } from "./ui/button"
import { Box, LayoutDashboard, Settings } from "lucide-react"
import { cn } from "~/lib/utils"

export function PortalSidebar() {

  const { pathname } = useLocation()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside className="w-16 min-w-16 bg-muted border-r flex-none flex flex-col items-center py-4 space-y-4">
      <Button variant="ghost" size="icon" asChild>
        <Link
          to="/"
          className={cn(isActive("/") ? "text-primary bg-gray-200 rounded-lg" : "", "hover:bg-gray-200")}
        >
          <LayoutDashboard className="h-6 w-6" />
          <span className="sr-only">Dashboard</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link
          to="/catalog"
          className={cn(isActive("/catalog") ? "text-primary bg-gray-200 rounded-lg" : "", "hover:bg-gray-200")}
        >
          <Box className="h-6 w-6" />
          <span className="sr-only">Catalog</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link
          to="/admin"
          className={cn(isActive("/admin") ? "text-primary bg-gray-200 rounded-lg" : "", "hover:bg-gray-200")}
        >
          <Settings className="h-6 w-6" />
          <span className="sr-only">Admin</span>
        </Link>
      </Button>
    </aside>
  )
}
