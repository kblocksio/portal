export interface ResourceQuery {
  group: string;
  version: string;
  plural: string;
  namespace?: string;
  name?: string;
}

export type Repository = {
  id: number;
  full_name: string;
  name: string;
  description: string;
  html_url: string;
  owner: {
    avatar_url: string;
    login: string;
  };
};

export type Installation = {
  id: number;
  account: {
    login: string;
  };
  repository_selection: "all" | "selected";
  access_tokens_url: string;
  repositories_url: string;
};

export interface ObjectMetadata {
  name: string;
  namespace: string;
  system: string;
}

export type Category = {
  title: string;
  description: string;
  icon: string;
  color: string;
  docslink: string;
};
