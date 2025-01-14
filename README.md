# Kblocks Portal

## Installation

Before you start, make sure you have cloned the [portal repository](https://github.com/kblocksio/portal) and run `npm i` in the root of the repository.

### Install on the same cluster

Install the basic kblocks required for the portal to work:

```sh
cd gallery
./install-blocks.sh kblocks/workload
./install-blocks.sh kblocks/project
./install-blocks.sh kblocks/cluster
./install-blocks.sh kblocks/organization
```

Now, install the portal to your cluster.

> **Redis Configuration Note:** This command will install a redis instance in your cluster and will set the needed `KBLOCKS_PUBSUB_*` properties values in the secret. In case you choose to install a different redis instance, set the `redis.enabled` property to `false` and set the `KBLOCKS_PUBSUB_*` properties values in the secret after the installation.

At the root of the repository, run the following command (replace `your-portal-cluster-name` with the name of your cluster and `your-portal-domain.com` with the domain of your portal):

```sh
helm upgrade --install portal ./deploy --namespace kblocks --create-namespace --set localCluster.name=your-portal-cluster-name --set redis.enabled=true --set ingress.enabled=true --set ingress.host=your-portal-domain.com
```

### Install the Portal and Kblocks on two different clusters

The installation process is basically the same as the one above, however you will need to manually install and configure the kblocks secret in your kblocks cluster in order for the portal to work.

**In your kblocks cluster:**

Install the basic kblocks required for the portal to work:

```sh
cd gallery
./install-blocks.sh kblocks/workload
./install-blocks.sh kblocks/project
./install-blocks.sh kblocks/cluster
./install-blocks.sh kblocks/organization
```

**In your portal cluster:**

Run the following command to install the portal (replace `your-portal-cluster-name` with the name of your cluster and `your-portal-domain.com` with the domain of your portal):

> Note that this time we are setting `secrets.kblocks.enabled` to `false` because we will install the kblocks secret manually in the next step (in the kblocks cluster).

> Also note that that if you decide to use a different redis instance you will need to follow [Redis Configuration Note](#redis-configuration-note).

```sh
helm upgrade --install portal ./deploy --namespace kblocks --create-namespace --set localCluster.name=your-portal-cluster-name --set redis.enabled=true --set ingress.enabled=true --set ingress.host=your-portal-domain.com --set secrets.kblocks.enabled=false
```

**In your kblocks cluster:**

Create the kblocks secret with the relevant values:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kblocks
  namespace: kblocks
type: Opaque
data:
  KBLOCKS_ACCESS: read_write
  KBLOCKS_SYSTEM_ID: your-cluster-name
  KBLOCKS_PUBSUB_HOST: your-redis-host.com
  KBLOCKS_PUBSUB_PORT: 18284
  KBLOCKS_PUBSUB_KEY: your-redis-key
```

## Local Setup and Development

## Prerequisites

- [docker](https://www.docker.com/)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [helm](https://helm.sh/)
- [skaffold](https://skaffold.dev/)
- [quickube](https://github.com/winglang/quickube)

## Setup

### 1. Setup your cluster

This system can be installed into any standard Kubernetes cluster.

If you want to test the portal locally, you can use `kind` to setup the environment.

Go to Docker Desktop settings and under **Resources** set:

- CPU limit: 10
- Memory limit: 20GB
- Swap: 3GB
- Virtual disk limit: 800GB

Install kind (v0.25.0 or above):

```sh
brew install kind
```

Then, make sure Docker is running and create a kind cluster:

```sh
./scripts/reinstall-kind.sh
```

### 2. Login to Docker Hub

We are using Docker Hub to publish images. Log in with the `wingcloudbot` user and password from
[1password]:

```sh
docker login -u wingcloudbot
Password: <SEE 1PASSWORD>
```

[1password]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=lzd45n6b5mraghh53hnq74hccy&h=wingcloud.1password.com

### 3. Build the frontend and backend

```sh
npm i
npm run build
```

### 4. Install secrets

We are using [git-crypt](https://github.com/AGWA/git-crypt) to encrypt our secrets in our
repository. Install git-crypt:

```sh
brew install git-crypt
```

Download the `git-crypt-key` master key from [1password](https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com).

Unlock the repository:

```sh
git-crypt unlock /path/to/git-crypt-key
```

Setup all of the secrets and certs to your cluster. Refer to [docs/enabling-slack-notifications.md](docs/enabling-slack-notifications.md) for more information on how to setup Slack notifications for the cluster.

> Replace `KBLOCKS_SYSTEM_ID` with the system id if you are installing to a non-local cluster

```sh
export KBLOCKS_SYSTEM_ID=local
./scripts/install-all-secrets.sh
```

### 6. Install the portal

Then, install the portal to your cluster. This is the command you can use to iterate on the portal
locally:

```sh
./install.sh
```

### 7. (Optional) Install demo block gallery

In this step we will install the demo block gallery. It is not required to install these into the
same cluster as the portal cluster.

```sh
./gallery/install-blocks.sh
```

Wait for all pods to be READY:

```sh
kubectl get pods -n kblocks
```

### 8. Deploy demo resources

Install the demo resources to your cluster:

```sh
cd demo && ./install.sh && cd ..
```

Now the portal should be available at [https://localhost.kblocks.io](https://localhost.kblocks.io).

---

## Local development

Update the `apps/web/.env` file with the following:

```
VITE_BACKEND_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/api/events
VITE_SKIP_AUTH=true
```

And also the `apps/server/.env` file with these `REDIS_*` variables:

```
KBLOCKS_PUBSUB_HOST=localhost
KBLOCKS_PUBSUB_PORT=6379
KBLOCKS_PUBSUB_KEY=pass1234
```

You can always copy their related `.env.example` files to `.env` and modify the values as needed.

Now run the dev script at the root of the repository:

```sh
npm run dev
```

This will start the backend and frontend locally, and also forward the Redis ports from the kind cluster.

Now, you can visit http://localhost:5173.

### Switching between local and staging

NOTE: The local installation is not using qkube, so don't expect to find the cluster when running `qkube ls`.

- To make sure that kubectl is using the right cluster, run `kubectl config current-context`. and make sure
  it points to `kind-kind`.
- To switch to the staging cluster, run `qkube use staging.quickube.sh`.
- To switch back to the local cluster, run `kubectl config use-context kind-kind`.

That's it. Have fun!
