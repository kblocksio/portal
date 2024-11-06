interface ImportMetaEnv {
  readonly VITE_BACKEND_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.md" {
  const content: string;
  export default content;
}
