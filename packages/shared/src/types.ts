export interface ResourceQuery {
  group: string;
  version: string;
  plural: string;
  namespace?: string;
  name?: string;
}


export type Project = {
  label: string;
  value: string;
  description: string;
};

export type Repository = {
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

export interface ResourceType {
  group: string;
  version: string;
  kind: string;

  plural: string;
  description?: string;
  readme?: string;
  icon?: string;
  color?: string;
  openApiSchema?: any;
}
