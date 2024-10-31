import { Installation, Repository } from "@repo/shared";
import { memo, useEffect, useMemo, useState } from "react";
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
  initialValue?: string;
  handleOnSelection?: (repository: Repository | null) => void;
}

export const RepoPicker = memo(function RepoPicker({
  initialValue,
  handleOnSelection,
}: RepoPickerProps) {
  const { data: installations, isLoading: isLoadingInstallations } = useFetch<
    Installation[]
  >("/api/github/installations");
  const [selectedInstallationLogin, setSelectedInstallationLogin] = useState(
    () => initialValue?.split("/")?.[0],
  );
  useEffect(() => {
    setSelectedInstallationLogin(
      (installationLogin) =>
        installationLogin ?? installations?.[0].account.login,
    );
  }, [installations]);
  const selectedInstallationId = useMemo(() => {
    return installations?.find(
      (installation) =>
        installation.account.login === selectedInstallationLogin,
    )?.id;
  }, [installations, selectedInstallationLogin]);

  const {
    data: repositories,
    refetch: refetchRepositories,
    isLoading: isLoadingRepositories,
  } = useFetch<Repository[]>(
    `/api/github/repositories?installation_id=${selectedInstallationId}`,
    undefined,
    false,
  );
  const [selectedRepositoryFullName, setSelectedRepositoryFullName] = useState(
    () => initialValue,
  );
  useEffect(() => {
    const repositoryExists = repositories?.find(
      (repo) => repo.full_name === selectedRepositoryFullName,
    );
    setSelectedRepositoryFullName((repositoryFullName) =>
      repositoryFullName && repositoryExists
        ? repositoryFullName
        : repositories?.[0]?.full_name,
    );
  }, [repositories, selectedRepositoryFullName]);

  useEffect(() => {
    if (!selectedInstallationId) {
      return;
    }
    refetchRepositories(
      `/api/github/repositories?installation_id=${selectedInstallationId}`,
    );
  }, [selectedInstallationId, refetchRepositories]);

  useEffect(() => {
    const selectedRepository = repositories?.find(
      (repo) => repo.full_name === selectedRepositoryFullName,
    );
    handleOnSelection?.(selectedRepository ?? null);
  }, [repositories, selectedRepositoryFullName, handleOnSelection]);

  const isLoading = useMemo(() => {
    return isLoadingInstallations || isLoadingRepositories;
  }, [isLoadingInstallations, isLoadingRepositories]);

  return (
    <div className="ml-2 mr-2 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Select
          disabled={isLoadingInstallations}
          value={selectedInstallationLogin}
          onValueChange={(installationLogin) =>
            setSelectedInstallationLogin(installationLogin)
          }
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
            {installations?.map((installation) => (
              <SelectItem
                key={installation.account.login}
                value={installation.account.login}
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
          value={selectedRepositoryFullName}
          onValueChange={(repositoryFullName) =>
            setSelectedRepositoryFullName(repositoryFullName)
          }
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
            {repositories?.map((repo) => (
              <SelectItem key={repo.full_name} value={repo.full_name}>
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
});
