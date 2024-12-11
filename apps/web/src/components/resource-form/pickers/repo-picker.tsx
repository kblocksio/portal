import { Repository } from "@kblocks-portal/shared";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { ExternalLink, Github, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Field } from "../form-field";
import { ManageGitHubInstallation } from "@/components/gh-manage-installation";
import { useGitHubInstallations } from "@/hooks/use-github-installations";
import { linkVariants } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RepoPickerProps {
  initialValue?: string;
  defaultValue?: string;
  fieldName: string;
  required?: boolean;
  description?: string;
  hideField?: boolean;
  handleOnSelection?: (repository: string | null) => void;
}

export const RepoPicker = memo(function RepoPicker({
  initialValue,
  defaultValue,
  fieldName,
  required,
  description,
  hideField,
  handleOnSelection,
}: RepoPickerProps) {
  const [selectedRepositoryFullName, setSelectedRepositoryFullName] = useState(
    () => initialValue,
  );

  const [selectedInstallationLogin, setSelectedInstallationLogin] = useState(
    () => initialValue?.split("/")?.[0] ?? defaultValue?.split("/")?.[0],
  );

  const { data: installations, isLoading: isLoadingInstallations } =
    useGitHubInstallations();

  useEffect(() => {
    setSelectedInstallationLogin(
      (currentInstallationLogin) =>
        currentInstallationLogin ?? installations?.login,
    );
  }, [installations]);

  const selectedInstallationId = useMemo(() => {
    return installations?.installations?.find(
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

  useEffect(() => {
    if (!repositories) return;

    const repositoryExists = repositories?.find(
      (repo) => repo.full_name === selectedRepositoryFullName,
    );
    setSelectedRepositoryFullName((currentRepositoryFullName) =>
      currentRepositoryFullName && repositoryExists
        ? currentRepositoryFullName
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
    handleOnSelection?.(selectedRepositoryFullName ?? null);
  }, [selectedRepositoryFullName, handleOnSelection]);

  const isLoading = useMemo(() => {
    return isLoadingInstallations || isLoadingRepositories;
  }, [isLoadingInstallations, isLoadingRepositories]);

  const [chosenRepositoryFullName] = useState(() => initialValue);
  const [changeEnabled, setChangeEnabled] = useState(false);

  return (
    <Field
      fieldName={fieldName}
      description={description}
      hideField={hideField}
      required={required}
    >
      <div className="ml-0 mr-0 flex flex-col gap-4">
        {chosenRepositoryFullName && !changeEnabled && (
          <div className="bg-muted text-foreground flex items-center gap-2 rounded-md p-2 text-sm">
            <Github className="text-muted-foreground ml-2 h-4 w-4" />
            <a
              href={`https://github.com/${chosenRepositoryFullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                linkVariants({ variant: "default" }),
                "inline-flex items-center gap-1",
              )}
            >
              {chosenRepositoryFullName}
              <ExternalLink className="size-4" />
            </a>
            <div className="grow"></div>
            <Button variant="outline" onClick={() => setChangeEnabled(true)}>
              Change
            </Button>
          </div>
        )}

        {changeEnabled &&
          installations &&
          installations.installations.length > 0 && (
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
                  {installations?.installations?.map((installation) => (
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
          )}

        {changeEnabled && installations && (
          <div className="mb-4 ml-2 mt-0 text-xs">
            <ManageGitHubInstallation
              githubAppInstalled={installations.githubAppInstalled}
            />
          </div>
        )}
      </div>
    </Field>
  );
});
