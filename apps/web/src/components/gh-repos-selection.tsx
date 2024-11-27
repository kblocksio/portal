import { Button } from "./ui/button.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetch } from "@/hooks/use-fetch.js";
import { Installation, Repository } from "@repo/shared";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar.js";
import { Input } from "./ui/input.js";
import { Skeleton } from "./ui/skeleton.js";
import { Checkbox } from "./ui/checkbox.js";
import { Loader, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils.js";

export interface ImportGHRepoProps {
  singleSelection?: boolean;
  singleActionLabel: string;
  multipleActionLabel: string;
  handleBack?: () => void;
  handleOnSelection: (repositories: Repository[]) => void;
}

export const ImportGHRepo = ({
  singleSelection,
  singleActionLabel,
  multipleActionLabel,
  handleBack,
  handleOnSelection,
}: ImportGHRepoProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const {
    data: installations,
    isLoading: isLoadingInstallations,
    refetch: refetchInstallations,
  } = useFetch<Installation[]>("/api/github/installations");
  const {
    data: repositories,
    refetch: refetchRepositories,
    isLoading: isLoadingRepositories,
  } = useFetch<Repository[]>(
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

  const isAllSelected = useMemo(() => {
    return (
      filteredRepositories.length > 0 &&
      filteredRepositories.every((repo) => selectedRepos.has(repo.full_name))
    );
  }, [filteredRepositories, selectedRepos]);

  const handleCheckboxChange = (repoFullName: string, checked: boolean) => {
    setSelectedRepos((prevSelectedRepos) => {
      const newSelectedRepos = new Set(prevSelectedRepos);
      if (checked) {
        newSelectedRepos.add(repoFullName);
      } else {
        newSelectedRepos.delete(repoFullName);
      }
      return newSelectedRepos;
    });
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedRepos(
        new Set(filteredRepositories.map((repo) => repo.full_name)),
      );
    } else {
      setSelectedRepos(new Set());
    }
  };

  useEffect(() => {
    if (!installations || installations.length === 0) {
      return;
    }
    refetchRepositories(
      `/api/github/repositories?installation_id=${installations[0].id}`,
    );
  }, [installations, refetchRepositories]);

  const isLoading = useMemo(() => {
    return isLoadingInstallations || isLoadingRepositories;
  }, [isLoadingInstallations, isLoadingRepositories]);

  const handleRepoSelectionAction = useCallback(
    (repo?: Repository) => {
      // if no repo is provided, we are selecting multiple repos
      if (!repo) {
        const repos =
          repositories?.filter((repo) => selectedRepos.has(repo.full_name)) ||
          [];
        handleOnSelection(repos);
      } else {
        // if a repo is provided, we are selecting a single repo by clicking on the action button
        setSelectedRepos(new Set([repo.full_name]));
        handleOnSelection([repo]);
      }
    },
    [handleOnSelection, selectedRepos, repositories],
  );

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
          {isLoading ? (
            <LoadingRepositories />
          ) : (
            <>
              <div className="flex justify-between">
                {!singleSelection && (
                  <div className="mb-4 flex items-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) =>
                        handleSelectAllChange(checked as boolean)
                      }
                    />
                    <span className="ml-2">Select All</span>
                  </div>
                )}
                <Button
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  onClick={() => refetchInstallations()}
                  className="mb-4 mr-2 flex items-center p-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.full_name}
                  className={cn(
                    "mb-2 grid grid-cols-[auto_40px_1fr_auto] items-start gap-4 border-b pb-2 pr-2 last:border-b-0",
                    selectedRepos.has(repo.full_name) && "bg-accent",
                  )}
                >
                  {!singleSelection && (
                    <Checkbox
                      className="self-center"
                      checked={selectedRepos.has(repo.full_name)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(repo.full_name, checked as boolean)
                      }
                    />
                  )}
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
                      className="flex flex-col gap-2 font-medium hover:underline"
                      rel="noreferrer"
                    >
                      {repo.full_name}
                    </a>
                    <p className="text-muted-foreground text-sm">
                      {repo.description}
                    </p>
                  </div>
                  <Button
                    disabled={selectedRepos.size > 0 || isLoading}
                    variant="outline"
                    onClick={() => {
                      handleRepoSelectionAction(repo);
                    }}
                  >
                    {singleActionLabel}
                    {isLoading && (
                      <Loader className="ml-2 h-5 w-5 animate-spin" />
                    )}
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="text-muted-foreground mb-4 mt-4 text-sm">
        <p>
          Can't find the repository you're looking for? You may need to adjust
          your GitHub App installation.{" "}
          <a
            href={import.meta.env.VITE_GITHUB_APP_INSTALLATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Manage GitHub App installation
          </a>
        </p>
      </div>
      <div className="flex justify-between">
        {handleBack && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {!singleSelection && (
          <Button
            disabled={isLoading || selectedRepos.size === 0}
            onClick={() => handleRepoSelectionAction()}
          >
            {multipleActionLabel}
            {isLoading && <Loader className="ml-2 h-5 w-5 animate-spin" />}
          </Button>
        )}
      </div>
    </div>
  );
};

const LoadingRepositories = () => {
  return (
    <>
      <div className="flex justify-between">
        <div className="mb-4 flex items-center">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="ml-2 h-5 w-20" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="mb-2 grid grid-cols-[auto_40px_1fr] items-start gap-4 border-b pb-2 pr-2 last:border-b-0"
        >
          <Skeleton className="h-5 w-5 self-center" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 self-center pr-4">
            <Skeleton className="h-5 w-[150px]" />
          </div>
        </div>
      ))}
    </>
  );
};
