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
import { Field } from "../form-field";
import { InputField } from "../input-field";
import { ManageGitHubInstallation } from "@/components/gh-manage-installation";

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

  const { data: installations, isLoading: isLoadingInstallations } = useFetch<
    Installation[]
  >("/api/github/installations");

  useEffect(() => {
    setSelectedInstallationLogin(
      (currentInstallationLogin) =>
        currentInstallationLogin ?? installations?.[0]?.account.login,
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

  if (import.meta.env.VITE_SKIP_AUTH) {
    return (
      <Field
        fieldName={fieldName}
        description={description}
        hideField={hideField}
        required={required}
      >
        <InputField
          required={required}
          placeholder="Enter repository name (GitHub integration is disabled in DEV mode)"
          type="text"
          value={initialValue ?? ""}
          onChange={(value) => {
            handleOnSelection?.(value as string);
          }}
        />
      </Field>
    );
  }

  return (
    <Field
      fieldName={fieldName}
      description={description}
      hideField={hideField}
      required={required}
    >
      <div className="ml-0 mr-0 flex flex-col gap-4">
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
        <div className="mb-4 ml-2 mt-0 text-xs">
          <ManageGitHubInstallation />
        </div>
      </div>
    </Field>
  );
});
