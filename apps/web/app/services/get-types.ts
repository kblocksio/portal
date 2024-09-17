import * as k8s from "@kubernetes/client-node";
import { ResourceType } from "@repo/shared";
import { getKubeConfig } from "~/services/k8s";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV ?? "dev"}` });

const kblocksConfigMap = process.env.KBLOCKS_CONFIG_MAP_ANNOTATION;
const kblocksNamespace = process.env.KBLOCKS_NAMESPACE;
const kblocksGroupName = process.env.KBLOCKS_GROUP_NAME;

if (!kblocksConfigMap) {
  throw new Error("KBLOCKS_CONFIG_MAP_ANNOTATION is not set");
}
if (!kblocksNamespace) {
  throw new Error("KBLOCKS_NAMESPACE is not set");
}
if (!kblocksGroupName) {
  throw new Error("KBLOCKS_GROUP_NAME is not set");
}

export const getTypes = async () => {
  const kc = getKubeConfig();
  const crdClient = kc.makeApiClient(k8s.ApiextensionsV1Api);

  try {
    const crds = await crdClient.listCustomResourceDefinition();
    const filteredCrds = crds.body.items.filter(
      (crd) => crd.spec.group === process.env.KBLOCKS_GROUP_NAME,
    );

    const crdsResult: ResourceType[] = [];

    for (const crd of filteredCrds) {
      const result: ResourceType = {
        kind: crd.spec.names.kind,
        group: crd.spec.group,
        plural: crd.spec.names.plural,
        version: crd.spec.versions[0].name,
      };

      if (crd?.metadata?.annotations) {
        const configmapName = crd.metadata.annotations[kblocksConfigMap!];
        const k8sConfigMapApi = kc.makeApiClient(k8s.CoreV1Api);
        const configMap = await k8sConfigMapApi.readNamespacedConfigMap(
          configmapName,
          kblocksNamespace!,
        );
        const crdConfigMap = configMap.body.data;
        result.color = crdConfigMap?.color;
        result.icon = crdConfigMap?.icon?.replace("heroicon://", "");
        result.readme = crdConfigMap?.readme;
        result.openApiSchema = crd.spec.versions[0]?.schema?.openAPIV3Schema;
        crdsResult.push(result);
      }
    }
    return crdsResult;
  } catch (error) {
    console.error(error);
    throw new Response("Internal Server Error", { status: 500 });
  }
};
