export interface ResourceQuery {
  group: string;
  version: string;
  plural: string;
  namespace: string;
  name: string;
}

export interface Condition {
  type?: string;
  status?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface Resource {
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    creationTimestamp?: string;
    uid?: string;
    resourceVersion?: string;
  };
  status: {
    conditions?: Condition[];
  };
}

export type Project = {
  label: string;
  value: string;
  description: string;
};

export type Repository = {
  name: string;
  description: string;
  owner: string;
};

export interface ResourceType {
  group: string;
  plural: string;
  version: string;
  kind: string;
  description?: string;
  readme?: string;
  icon?: string;
  color?: string;
  openApiSchema?: any;
}
