import { linkVariants } from "./ui/link";

const GITHUB_APP_INSTALLATION_URL = (() => {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", import.meta.env.VITE_GITHUB_CLIENT_ID);
  url.searchParams.set(
    "redirect_uri",
    `${location.origin}/api/auth/callback/github`,
  );
  return url.toString();
})();

const GITHUB_APP_MANAGE_INSTALLATIONS_URL = (() => {
  const url = new URL(
    `https://github.com/apps/${import.meta.env.VITE_GITHUB_NAME}/installations/new`,
  );
  return url.toString();
})();

export const ManageGitHubInstallation = (props: {
  githubAppInstalled: boolean;
}) => {
  return (
    <div className="text-muted-foreground bg-muted border-muted-foreground rounded-md border border-dashed p-2">
      {!props.githubAppInstalled && (
        <p>
          <a
            href={GITHUB_APP_INSTALLATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkVariants({ variant: "default" })}
          >
            Install our GitHub App
          </a>{" "}
          in order to use this feature.{" "}
        </p>
      )}
      {props.githubAppInstalled && (
        <div className="flex flex-col gap-1">
          <p>
            Can&apos;t find the repository you&apos;re looking for? You may need
            to adjust your GitHub App installation.
          </p>
          <a
            href={GITHUB_APP_MANAGE_INSTALLATIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkVariants({ variant: "default" })}
          >
            Manage GitHub App installation
          </a>
        </div>
      )}
    </div>
  );
};
