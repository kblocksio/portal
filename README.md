# Kblocks Portal

Before you start, make sure you have:

1. Cloned the [portal repository](https://github.com/kblocksio/portal).
2. Run `npm i` in the root of the repository.

> Follow [enabling-slack-notifications.md](docs/enabling-slack-notifications.md) to get Slack notifications.

> AI support is enabled by setting `OPENAI_API_KEY` in the `kblocks-api-secrets` secret. This can also be done in the `secrets/portal.env` file before installation.

**Install the basic Kblocks required for the portal:**

```sh
cd gallery
./install-blocks.sh kblocks/workload
./install-blocks.sh kblocks/project
./install-blocks.sh kblocks/organization
```

**Install the Portal:**

> **Redis Configuration Note:**  
> The following command will install a Redis instance in your cluster and set the necessary `KBLOCKS_PUBSUB_*` properties in the `kblocks` secret and `KBLOCKS_PUBSUB_HOST` and `KBLOCKS_PUBSUB_KEY` in the portal's `kblocks-api-secrets` secret. If you prefer installing a different Redis instance, set `redis.enabled=false` and manually configure the above properties in each secret after installation.

Replace `your-portal-cluster-name` with your cluster name and `your-portal-domain.com` with your portal’s domain and run the following command from the root of the repository:

```sh
helm upgrade --install portal ./deploy \
  --namespace default \
  --create-namespace \
  --set redis.enabled=true \
  --set ingress.enabled=true \
  --set ingress.host=your-portal-domain.com
```
