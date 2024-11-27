interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_SKIP_AUTH: string;
  readonly VITE_GITHUB_APP_INSTALLATION_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
