import { Link } from "@remix-run/react"
import { Button } from "./ui/button"
import { Box, LayoutDashboard, Settings } from "lucide-react"

export function PortalSidebar() {
  return (
    <aside className="w-16 bg-muted border-r flex flex-col items-center py-4 space-y-4">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <LayoutDashboard className="h-6 w-6" />
          <span className="sr-only">Dashboard</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link to="/catalog">
          <Box className="h-6 w-6" />
          <span className="sr-only">Catalog</span>
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild>
        <Link to="/admin">
          <Settings className="h-6 w-6" />
          <span className="sr-only">Admin</span>
        </Link>
      </Button>
    </aside>
  )
}
