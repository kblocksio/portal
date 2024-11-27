import { linkVariants } from "./ui/link";

const GITHUB_APP_INSTALLATION_URL = (() => {
  const url = new URL(import.meta.env.VITE_GITHUB_APP_INSTALLATION_URL);
  url.searchParams.set(
    "redirect_uri",
    `${location.origin}/api/auth/callback/github`,
  );
  url.searchParams.set(
    "redirect_url",
    `${location.origin}/api/auth/callback/github`,
  );
  return url.toString();
})();

export const ManageGitHubInstallation = () => {
  return (
    <div className="text-muted-foreground">
      <p>
        Can&apos;t find the repository you&apos;re looking for? You may need to
        adjust your GitHub App installation.{" "}
        <a
          href={GITHUB_APP_INSTALLATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkVariants({ variant: "default" })}
        >
          Manage GitHub App installation
        </a>
      </p>
    </div>
  );
};
