import { Manifest } from "@kblocks/api";

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

export interface ObjectMetadata {
  name: string;
  namespace: string;
  system: string;
}
