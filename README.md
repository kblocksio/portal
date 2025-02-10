# Kblocks Portal

## Installation

This guide will walk you through the steps to install the Kblocks Portal.

### Prerequisites

Before you start, make sure you have:

1. Have access to a Kubernetes cluster. We recommend
   [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) with [nginx
   ingress](https://kind.sigs.k8s.io/docs/user/ingress/#ingress-nginx) for a local deployment.
2. Cloned the [portal repository](https://github.com/kblocksio/portal).
3. Run `npm i` in the root of the repository.

### Core Block Installation

> Follow [enabling-slack-notifications.md](docs/enabling-slack-notifications.md) to get Slack notifications.

> AI support is enabled by setting `OPENAI_API_KEY` in the `kblocks-api-secrets` secret. This can also be done in the `secrets/portal.env` file before installation.

**Install the basic Kblocks required for the portal:**

```sh
cd gallery
./install-blocks.sh kblocks/workload
./install-blocks.sh kblocks/project
./install-blocks.sh kblocks/organization
cd ..
```

### Portal Installation

> **Redis Configuration Note:**  
> The following command will install a Redis instance in your cluster and set the necessary
> `KBLOCKS_PUBSUB_*` properties in the `kblocks` secret and `KBLOCKS_PUBSUB_HOST` and
> `KBLOCKS_PUBSUB_KEY` in the portal's `kblocks-api-secrets` secret. If you prefer installing a
> different Redis instance, set `redis.enabled=false` and manually configure the above properties in
> each secret after installation.

Export the following environment variables:

```sh
export KBLOCKS_CLUSTER_NAME=your-portal-cluster-name
export KBLOCKS_DOMAIN=your-portal-domain.com
```

Run the following command from the root of the repository:

```sh
helm upgrade --install portal ./deploy \
  --namespace default \
  --create-namespace \
  --set redis.enabled=true \
  --set ingress.enabled=true \
  --set localCluster.name=$KBLOCKS_CLUSTER_NAME \
  --set ingress.host=$KBLOCKS_DOMAIN
```

### Wait for the portal to be ready

It will take a few minutes for the portal to be ready. Eventually you should see the following pods
running:

```sh
$ kubectl get pods
NAME                                                   READY   STATUS    RESTARTS   AGE
portal-backend-deployment-c8463887-5d745d5d75-nj75c    1/1     Running   0          3m48s
portal-backend-deployment-c8463887-5d745d5d75-wz28g    1/1     Running   0          3m48s
portal-frontend-deployment-c830622b-7447b75f97-2rz4c   1/1     Running   0          3m43s
portal-frontend-deployment-c830622b-7447b75f97-zhcgs   1/1     Running   0          3m43s
portal-redis-664db84547-wkdqc                          1/1     Running   0          4m50s
```

### Accessing the portal

```sh
open https://$KBLOCKS_DOMAIN
```


### Installing additional blocks

Now that your portal is set up, you can install additional blocks.

Follow the instructions under [kblocks.io](https://kblocks.io) to create a new block, and when
installing it, make sure to install the block under the `kblocks` namespace:

```sh
cd my-block
kb install -n kblocks
```

## License

The kblocks portal is not allowed to be used for commercial purposes.