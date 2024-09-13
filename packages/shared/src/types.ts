export interface K8sRequestParams {
  group: string;
  version: string;
  plural: string;
  namespace: string;
  name: string;
}

export type ApiGroup = {
  group: string;
  version: string;
  icon: string;
  plural: string;
};

export type Project = {
  label: string;
  value: string;
  description: string;
};

export interface CRD {
  kind: string;
  description?: string;
  readme?: string;
  icon?: string;
  color?: string;
  openApiSchema?: any;
}
