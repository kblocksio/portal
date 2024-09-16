import express, { Express } from "express";
import { config } from "dotenv";
import cors from "cors";
import { ResourceType, ResourceQuery, Resource } from "@repo/shared";
import { kubernetesRequest } from "./k8s";
// import apiGroups from "./mock-data/api-groups.json";
import projects from "./mock-data/projects.json";
import * as k8s from "@kubernetes/client-node";

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

const kubectl = new k8s.KubeConfig();
kubectl.loadFromDefault();
const crdClient = kubectl.makeApiClient(k8s.ApiextensionsV1Api);

const port = process.env.PORT || 3001;
const app: Express = express();
app.use(express.json());
app.use(
  "*",
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

const createRoutes = () => {
  app.get("/api/resources", async (req, res) => {
    const params = req.query as unknown as ResourceQuery;

    const url = [];

    if (params.group === "core") {
      url.push("api");
    } else {
      url.push("apis");
      url.push(params.group);
    }

    url.push(params.version);
    url.push(params.plural);

    const result = await kubernetesRequest(url.join("/"));
    const data = await result.json() as { items: Resource[] };

    return res.status(200).json(data);
  });

  app.get("/api/projects", async (_, res) => {
    return res.status(200).json(projects);
  });

  app.get("/api/types", async (_, res) => {
    try {
      const crds = await crdClient.listCustomResourceDefinition();
      const filteredCrds = crds.body.items.filter(
        (crd) => crd.spec.group === kblocksGroupName,
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
          const configmapName =
            crd.metadata.annotations[kblocksConfigMap];
          const k8sConfigMapApi = kubectl.makeApiClient(k8s.CoreV1Api);
          const configMap = await k8sConfigMapApi.readNamespacedConfigMap(
            configmapName,
            kblocksNamespace,
          );
          const crdConfigMap = configMap.body.data;
          result.color = crdConfigMap?.color;
          result.icon = crdConfigMap?.icon?.replace("heroicon://", "");
          result.readme = crdConfigMap?.readme;
          result.openApiSchema = crd.spec.versions[0]?.schema?.openAPIV3Schema;
          crdsResult.push(result);
        }
      }
      return res.status(200).json(crdsResult);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

createRoutes();

export default app;
