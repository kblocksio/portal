import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "@remix-run/react";
import { Github } from "lucide-react";
import { useFetch } from "~/hooks/use-fetch";
import { Repository } from "@repo/shared";

export const ImportGHRepo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data } = useFetch<Repository[]>("/api/repositories");

  const filteredRepositories = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    };
    return data.filter((repo) => repo.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm, data])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4">
          <Github className="mr-2" />
          Import GitHub Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[520px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Github className="mr-2" />
            Import GitHub Repository
          </DialogTitle>
          <DialogDescription>Select a repository to import.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            type="search"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 mb-4"
          />
          <div className="flex flex-col gap-4">
            <div className="h-[300px] overflow-auto">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.name}
                  className="grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-muted pb-2 mb-2 pr-2"
                >
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt={`@${repo.owner}`} />
                    <AvatarFallback>{repo.owner[0]}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <Link to="#" className="font-medium hover:underline">
                      {repo.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{repo.description}</p>
                  </div>
                  <Button variant="outline">Import</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
};
