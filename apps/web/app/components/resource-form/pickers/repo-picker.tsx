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
import { useFetch } from "~/hooks/use-fetch";

interface RepoPickerProps {
  handleOnSelection: (repository: Repository | null) => void;
  initialValue?: string | null;
}

export const RepoPicker = ({
  handleOnSelection,
  initialValue,
}: RepoPickerProps) => {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

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

  useEffect(() => {
    if (!installations || installations.length === 0) {
      return;
    }
    refetchRepositories(
      `/api/github/repositories?installation_id=${installations[0].id}`,
    );
  }, [installations, refetchRepositories]);

  // set the selected repo if the initial value is set
  useEffect(() => {
    if (!repositories || !initialValue) {
      return;
    }
    setSelectedRepo(
      repositories?.find(
        (repo) => repo.full_name === initialValue,
      ) as Repository,
    );
  }, [initialValue, repositories]);

  const isLoading = useMemo(() => {
    return isLoadingInstallations || isLoadingRepositories;
  }, [isLoadingInstallations, isLoadingRepositories]);

  return (
    <div className="ml-2 mr-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Select
          disabled={isLoading || !repositories}
          onValueChange={(value) => {
            const selectedRepo = repositories?.find(
              (repo) => repo.full_name === value,
            ) as Repository;
            setSelectedRepo(selectedRepo);
            handleOnSelection(selectedRepo);
          }}
          value={selectedRepo?.full_name}
        >
          <SelectTrigger className="w-full">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select an option" />
            )}
          </SelectTrigger>
          <SelectContent>
            {repositories &&
              repositories.map((repo) => (
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
            className="text-primary hover:underline"
          >
            Manage GitHub App installation
          </a>
        </p>
      </div>
    </div>
  );
};
