import { Installation, Repository } from "@repo/shared";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Github, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { linkVariants } from "@/components/ui/link";

interface RepoPickerProps {
  handleOnSelection?: (repository: Repository | null) => void;
}

export const RepoPicker = ({ handleOnSelection }: RepoPickerProps) => {
  const [selectedInstallationId, setSelectedInstallationId] =
    useState<string>();
  const { data: installations, isLoading: isLoadingInstallations } = useFetch<
    Installation[]
  >("/api/github/installations");

  useEffect(() => {
    setSelectedInstallationId(
      installations && installations.length > 0
        ? installations[0].id.toString()
        : undefined,
    );
  }, [installations]);

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>();
  const {
    data: repositories,
    refetch: refetchRepositories,
    isLoading: isLoadingRepositories,
  } = useFetch<Repository[]>(
    `/api/github/repositories?installation_id=${installations?.[0]?.id}`,
    undefined,
    false,
  );
  useEffect(() => {
    setSelectedRepositoryId(
      repositories && repositories.length > 0
        ? repositories[0].id.toString()
        : undefined,
    );
  }, [repositories]);

  useEffect(() => {
    if (!selectedInstallationId) {
      return;
    }
    refetchRepositories(
      `/api/github/repositories?installation_id=${selectedInstallationId}`,
    );
  }, [selectedInstallationId, refetchRepositories]);

  const selectedRepository = useMemo(() => {
    return repositories?.find(
      (repo) => repo.id.toString() === selectedRepositoryId,
    );
  }, [selectedRepositoryId, repositories]);

  useEffect(() => {
    handleOnSelection?.(selectedRepository ?? null);
  }, [selectedRepository, handleOnSelection]);

  const isLoading = useMemo(() => {
    return isLoadingInstallations || isLoadingRepositories;
  }, [isLoadingInstallations, isLoadingRepositories]);

  return (
    <div className="ml-2 mr-2 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Select
          disabled={isLoadingInstallations}
          value={selectedInstallationId}
          onValueChange={setSelectedInstallationId}
        >
          <SelectTrigger className="w-full">
            {isLoadingInstallations ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select an organization" />
            )}
          </SelectTrigger>
          <SelectContent>
            {installations &&
              installations.map((installation) => (
                <SelectItem
                  key={installation.id}
                  value={installation.id.toString()}
                >
                  <div className="flex items-center">
                    <Github className="mr-2 h-4 w-4" />
                    {installation.account.login}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          disabled={isLoading}
          value={selectedRepositoryId}
          onValueChange={setSelectedRepositoryId}
        >
          <SelectTrigger className="w-full">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading repositories...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select a repository" />
            )}
          </SelectTrigger>
          <SelectContent>
            {repositories &&
              repositories.map((repo) => (
                <SelectItem
                  key={repo.id.toString()}
                  value={repo.full_name.toString()}
                >
                  <div className="flex items-center">
                    <Github className="mr-2 h-4 w-4" />
                    {repo.full_name}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-muted-foreground mb-4 mt-4 text-sm">
        <p>
          Can't find the repository you're looking for? You may need to adjust
          your GitHub App installation.{" "}
          <a
            href="https://github.com/apps/kblocks-io/installations/new"
            target="_blank"
            rel="noopener noreferrer"
            className={linkVariants({ variant: "default" })}
          >
            Manage GitHub App installation
          </a>
        </p>
      </div>
    </div>
  );
};
