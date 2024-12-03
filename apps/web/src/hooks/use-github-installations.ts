import type { Installation } from "@repo/shared";
import { useFetch } from "./use-fetch";

export const useGitHubInstallations = () => {
  return useFetch<{
    githubAppInstalled: boolean;
    login?: string;
    installations: Installation[];
  }>("/api/github/installations", undefined, true, {
    revalidateOnFocus: true,
  });
};
