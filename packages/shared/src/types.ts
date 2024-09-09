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
