# Kblocks Portal

## Portal Installation

This guide will walk you through the steps to install the Kblocks Portal.

### Prerequisites

Before you start, make sure you have:

1. Have access to a Kubernetes cluster.
2. Cloned the [portal repository](https://github.com/kblocksio/portal).
3. Run `npm i` in the root of the repository.

For local development, we recommend
[kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) with [nginx
ingress](https://kind.sigs.k8s.io/docs/user/ingress/#ingress-nginx) for a local deployment. 

The following script will install kind, create a cluster, and install the ingress controller and
also add `demo.kblocks.io` to your `/etc/hosts` file so you can access the portal at
`https://demo.kblocks.io`.

```sh
./scripts/reinstall-kind.sh
```

### Core Blocks

First, we need to install a bunch of core blocks that are used by the portal itself:

```sh
cd gallery
./install-blocks.sh kblocks/workload
./install-blocks.sh kblocks/project
./install-blocks.sh kblocks/organization
cd ..
```

### SSL Certificate Setup

If you wish to connect to the portal via HTTPS, you will need to install an SSL certificate to the
`kblocks-tls` secret.

You can use this command to install the certificate:

```sh
kubectl create secret tls kblocks-tls --key=$key --cert=$cert -n default
```

> You can download the `.key` and `.pem` files for `*.kblocks.io` from
> [DNSimple](https://dnsimple.com/a/137210/domains/kblocks.io/certificates/1864734/installation)
> (under NGINX).


### Frontend and Backend

Export the following environment variables:

```sh
export KBLOCKS_CLUSTER_NAME=localhost
export KBLOCKS_DOMAIN=localhost.kblocks.io
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

## Adding Blocks to your Cluster

Now that your portal is set up, you can install additional blocks.

Generally speaking, follow the instructions under [kblocks.io](https://kblocks.io) to create a new
block, and when installing it, make sure to install the block under the `kblocks` namespace:

```sh
cd my-block
kb install -n kblocks
```

This repository includes many example blocks under `gallery`. This script will install all example
blocks:

```sh
cd gallery
./install-blocks.sh
```

## Additional Customizations

### Slack

Follow [enabling-slack-notifications.md](docs/enabling-slack-notifications.md) to get Slack
notifications.

### AI

AI support is enabled by setting `OPENAI_API_KEY` in the `kblocks-api-secrets` secret. This can also
be done in the `secrets/portal.env` file before installation.

### Redis

The above instructions will install a Redis instance in your cluster and set the necessary
`KBLOCKS_PUBSUB_*` properties in the `kblocks` secret and `KBLOCKS_PUBSUB_HOST` and
`KBLOCKS_PUBSUB_KEY` in the portal's `kblocks-api-secrets` secret. If you prefer installing a
different Redis instance, set `redis.enabled=false` and manually configure the above properties in
each secret after installation.

## License

The kblocks portal is not allowed to be used for commercial purposes.