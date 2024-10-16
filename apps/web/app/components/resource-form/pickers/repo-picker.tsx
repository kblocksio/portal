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
import { Button } from "../../ui/button";
import { InputField } from "../input-field";
import { Field } from "../field-renderer";

interface RepoPickerProps {
  handleOnSelection: (repository: Repository | null) => void;
  initialValue?: Repository | null;
}

export const RepoPicker = ({
  handleOnSelection,
  initialValue,
}: RepoPickerProps) => {
  return (
    <Field
      fieldName="repo"
      required
      description="The GitHub repository to use for the service."
    >
      <InputField
        value={initialValue?.full_name ?? ""}
        onChange={(value) => {
          handleOnSelection({
            full_name: value as string,
            name: "dummy",
            owner: {
              login: "dummy",
              avatar_url: "dummy",
            },
            html_url: `https://dummy.com`,
            description: "dummy",
          });
        }}
      />
    </Field>
  );
};

// TODO: fix this!
export const RepoPicker2 = ({
  handleOnSelection,
  initialValue,
}: RepoPickerProps) => {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(
    initialValue ?? null,
  );

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

  const isLoading = useMemo(() => {
    return isLoadingInstallations || isLoadingRepositories;
  }, [isLoadingInstallations, isLoadingRepositories]);

  return (
    <div className="ml-2 mr-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Select
          disabled={isLoading}
          onValueChange={(value) =>
            setSelectedRepo(
              (repositories?.find(
                (repo) => repo.full_name === value,
              ) as Repository) ?? null,
            )
          }
          value={initialValue?.full_name}
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
        <Button
          variant="outline"
          role="button"
          className="ml-2"
          disabled={!selectedRepo || isLoading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOnSelection(
              (repositories?.find(
                (repo) => repo.full_name === selectedRepo?.full_name,
              ) as Repository) ?? null,
            );
          }}
        >
          Choose
        </Button>
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
