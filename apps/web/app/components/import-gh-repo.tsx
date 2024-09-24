import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import { useFetch } from "~/hooks/use-fetch";
import { Installation, Repository } from "@repo/shared";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar.js";
import { Input } from "./ui/input.js";

export interface ImportGHRepoProps {
  handleBack: () => void;
}

export const ImportGHRepo = ({ handleBack }: ImportGHRepoProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: installations } = useFetch<Installation[]>(
    "/api/github/installations",
  );
  const { data: repositories, refetch: refetchRepositories } = useFetch<
    Repository[]
  >(
    `/api/github/repositories?installation_id=${installations?.[0]?.id}`,
    undefined,
    false,
  );

  const filteredRepositories = useMemo(() => {
    if (!repositories || repositories.length === 0) {
      return [];
    }
    const repos = repositories.filter((repo) =>
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return repos;
  }, [searchTerm, repositories]);

  useEffect(() => {
    if (!installations || installations.length === 0) {
      return;
    }
    refetchRepositories(
      `/api/github/repositories?installation_id=${installations[0].id}`,
    );
  }, [installations, refetchRepositories]);

  return (
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
              key={repo.full_name}
              className="mb-2 grid grid-cols-[40px_1fr_auto] items-start justify-between gap-4 border-b pb-2 pr-2 last:border-b-0"
            >
              <Avatar>
                <AvatarImage
                  alt={`@${repo.owner.login}`}
                  src={repo.owner.avatar_url}
                />
                <AvatarFallback>{repo.owner.login}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pr-4">
                <a
                  href={repo.html_url}
                  target="_blank"
                  className="flext-col flex gap-2 font-medium hover:underline"
                  rel="noreferrer"
                >
                  {repo.full_name}
                </a>
                <p className="text-muted-foreground text-sm">
                  {repo.description}
                </p>
              </div>
              <Button variant="outline">Import</Button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit">Import Selected</Button>
      </div>
    </div>
  );
};
