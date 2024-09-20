import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { Github, Link } from "lucide-react";
import { useFetch } from "~/hooks/use-fetch";
import { Repository } from "@repo/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog.js";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar.js";
import { Input } from "./ui/input.js";

export const ImportGHRepo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data } = useFetch<Repository[]>(
    `${import.meta.env.VITE_SERVER_URL}/api/repositories`,
  );

  const filteredRepositories = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    return data.filter((repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, data]);

  // const { openPopupWindow } = usePopupWindow();

  // const [authenticating, setAuthenticating] = useState(false);
  // const authenticate = useCallback(
  //   async () => {
  //     // setAuthenticating(true);
  //     const url = new URL("https://github.com/login/oauth/authorize");
  //     url.searchParams.append(
  //       "client_id",
  //       import.meta.env.VITE_GITHUB_CLIENT_ID,
  //     );

  //     const session = await supabase.auth.getSession();
  //     const access_token = session.data.session?.access_token;
  //     if (!access_token) {
  //       console.error("No access token found");
  //       location.assign("/");
  //       return;
  //     }
  //     url.searchParams.append("state", access_token);

  //     const redirectUrl = new URL(location.origin);
  //     redirectUrl.pathname = "/api/auth/installation/callback";
  //     url.searchParams.append("redirect_uri", redirectUrl.toString());

  //     // openPopupWindow({
  //     //   url,
  //     //   onClose() {
  //     //     setAuthenticating(false);
  //     //   },
  //     // });

  //     open(url, "_blank");
  //   },
  //   [
  //     //openPopupWindow
  //   ],
  // );

  return (
    // <Button className="ml-4" onClick={authenticate} disabled={authenticating}>
    //   {authenticating ? (
    //     <>
    //       <Loader2 className="mr-2 animate-spin" />
    //       Authenticating...
    //     </>
    //   ) : (
    //     <>
    //       <Github className="mr-2" />
    //       Import GitHub Repository
    //     </>
    //   )}
    // </Button>
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4">
          <Github className="mr-2" />
          Import GitHub Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[520px] overflow-hidden sm:max-w-[600px]">
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
            className="mb-4 h-9"
          />
          <div className="flex flex-col gap-4">
            <div className="h-[300px] overflow-auto">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.name}
                  className="border-muted mb-2 grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b pb-2 pr-2"
                >
                  <Avatar>
                    <AvatarImage
                      src="/placeholder-user.jpg"
                      alt={`@${repo.owner}`}
                    />
                    <AvatarFallback>{repo.owner[0]}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <Link to="#" className="font-medium hover:underline">
                      {repo.name}
                    </Link>
                    <p className="text-muted-foreground text-sm">
                      {repo.description}
                    </p>
                  </div>
                  <Button variant="outline">Import</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
