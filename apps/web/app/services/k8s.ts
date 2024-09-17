import * as k8s from "@kubernetes/client-node";
import { config } from "dotenv";
import axios from "axios";
import https from 'https';

config({ path: `.env.${process.env.NODE_ENV ?? "dev"}` });

// Create and configure KubeConfig
export const getKubeConfig = () => {
  const kc = new k8s.KubeConfig();

  if (
    process.env.KUBE_API_URL &&
    process.env.KUBE_CA_CERT &&
    process.env.KUBE_CLIENT_CERT &&
    process.env.KUBE_CLIENT_KEY
  ) {
    kc.loadFromOptions({
      clusters: [
        {
          name: process.env.KUBE_CLUSTER_NAME || "default-cluster",
          server: process.env.KUBE_API_URL,
          caData: process.env.KUBE_CA_CERT,
        },
      ],
      users: [
        {
          name: process.env.KUBE_USER_NAME || "default-user",
          certData: process.env.KUBE_CLIENT_CERT,
          keyData: process.env.KUBE_CLIENT_KEY,
        },
      ],
      contexts: [
        {
          name: process.env.KUBE_CONTEXT_NAME || "default-context",
          user: process.env.KUBE_USER_NAME || "default-user",
          cluster: process.env.KUBE_CLUSTER_NAME || "default-cluster",
        },
      ],
      currentContext: process.env.KUBE_CONTEXT_NAME || "default-context",
    });
  } else {
    console.warn(
      "k8s Kubernetes configuration not found in environment variables. Falling back to default config.",
    );
    kc.loadFromDefault();
  }
  return kc;
}


function createKubernetesAxiosClient() {
  const kubernetesAxiosClient = axios.create({
    baseURL: process.env.KUBE_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.KUBE_TOKEN}`, // Token-based authentication
    },
    httpsAgent: new https.Agent({
      ca: Buffer.from(process.env.KUBE_CA_CERT!, 'base64'), // CA certificate
      cert: process.env.KUBE_CLIENT_CERT
        ? Buffer.from(process.env.KUBE_CLIENT_CERT!, 'base64')
        : undefined, // Optional client certificate
      key: process.env.KUBE_CLIENT_KEY
        ? Buffer.from(process.env.KUBE_CLIENT_KEY!, 'base64')
        : undefined, // Optional client key
    }),
  });

  return kubernetesAxiosClient;
}


export async function kubernetesRequest(
  pathname: string,
  options?: any,
): Promise<Response> {
  const kc = getKubeConfig();
  const cluster = kc.getCurrentCluster();

  if (!cluster) {
    return new Response("No cluster found", { status: 500 });
  }

  const server = cluster.server;
  const parts = [server];
  parts.push(...pathname.split("/").filter((part) => part !== ""));

  const url = parts.join("/");

  try {
    const k8sClient = createKubernetesAxiosClient();
    const response = await k8sClient.get(url);

    if (response.status !== 200) {
      console.error("Kubernetes API request error:", response);
      return new Response(JSON.stringify(response.data), { status: response.status });
    }

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error: any) {
    console.error('Kubernetes API request error:', error.response?.data || error.message);
    return new Response(error.response?.data || error.message, { status: error.response?.status || 500 });
  }
}
