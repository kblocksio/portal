# Kblocks Portal

## Prerequisites

- [docker](https://www.docker.com/)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [helm](https://helm.sh/)
- [skaffold](https://skaffold.dev/)
- [quickube](https://github.com/winglang/quickube)

## Setup

#### Install dependencies

```sh
npm i
```

#### Sign in to Docker Hub

We are using Docker Hub to publish images. Log in with the `wingcloudbot` user and password from [1password]:

```sh
docker login -u wingcloudbot
Password: <SEE 1PASSWORD>
```

[1password]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=lzd45n6b5mraghh53hnq74hccy&h=wingcloud.1password.com

## Local development

We only have support for local development of the frontend, but not the backend (at the moment).

Simply:

```sh
cd apps/web
npm run dev
```

This will start the frontend locally and connect it to the production backend.

## Backend development cycle

Switch to the backend cluster:

```sh
qkube use portal-backend.quickube.sh
```

Deploy:

```sh
skaffold run
```

You can use it to run the app and tail the logs:

```sh
skaffold run --tail
```

Or even watch for changes with hot reloading:

```sh
skaffold dev
```

## Production Setup

### Architecture

Hosting:

- Frontend is hosted in Vercel.
- Backend is deployed on a quickube cluster by the name of `portal-backend.quickube.sh`.
- Block gallery ([source](https://github.com/winglang/kblocks-gallery)) is deployed on a quickube cluster by the name of `kblocks-demo.quickube.sh`.

We use [DNSimple](https://dnsimple.com/a/137210/domains/kblocks.io):

- The root `A` record (`kblocks.io`) points to Vercel
- The subdomain `api.kblocks.io` has a CNAME that points to `portal-backend.quickube.sh`.
- Vercel rewrites all requests to `kblocks.io/api` to `api.kblocks.io/api`, so we don't need CORS.

**_Do I need to modify the DNS records if I provision a new cluster?_** Probably not. Technically,
if a new cluster is provisioned, there is no need to change any DNS configuration as long as the
cluster name is `portal-backend.quickube.sh`. If you change it, then the CNAME needs to be updated
accordingly (bear in mind DNS propagation and cache).

### Repositories

Clone the repositories:

```sh
git clone git@github.com:winglang/portal
cd portal
export REPO=$PWD
cd ..
```

We will use `$REPO` to refer to the portal repository directory on your local system.

### Installing Secrets

The following steps need to be performed once in order to install configuration and secrets to our
clusters.

Configuration and secrets are all managed together in `.env` files that can be downloaded from a [1Password secret] and
stored in Kubernetes secrets within the clusters. These secrets are referenced by pods.

#### Download secrets from 1Password

First, let's create a directory for our secrets:

```sh
mkdir $HOME/kblocks-demo-secrets
cd $HOME/kblocks-demo-secrets
export SECRETS=$PWD
```

We will refer to this directory as `$SECRETS` throughout the document.

Now, download all the secret files from the [1Password secret] to this directory. We expect the
following files:

- `kblocks-gallery.env` - environment for kblocks-gallery
- `portal.env` - environment for portal-backend
- `kblocks_io.key` - SSL certificate private key
- `kblocks_io.pem` - SSL certificate public key

#### Install secrets

And we are ready to install the secrets:

1. Install the **gallery secrets** to the `kblocks-demo.quickube.sh` cluster:

   ```sh
   qkube use kblocks-demo.quickube.sh
   KBLOCKS_SYSTEM_ID=demo $REPO/gallery/scripts/install-gallery-secrets.sh $SECRETS/kblocks-gallery.env
   ```

2. We will also install the **gallery secrets** to the `portal-backend.quickube.sh` cluster as well
   because our backend needs the `Workload` block:

   ```sh
   qkube use portal-backend.quickube.sh
   KBLOCKS_SYSTEM_ID=portal-backend.quickube.sh $REPO/gallery/scripts/install-gallery-secrets.sh $SECRETS/kblocks-gallery.env
   ```

3. Install the **backend secrets** to the `portal-backend.quickube.sh` (these are needed by the
   backend service to operate):

   ```sh
   $REPO/scripts/install-secrets.sh $SECRETS/portal.env
   ```

4. Finally, we need to install the SSL certificates to the portal backend cluster as well:

   ```sh
   $REPO/scripts/install-cert.sh $SECRETS/kblocks_io.key $SECRETS/kblocks_io.pem
   ```

At this point we should have the two clusters ready for installing the blocks and backend service.

### Backend Installation

Our backend uses the `Workload` block for deployment )(yes, we eat our own dogfood), so before we install the backend
we need to install this block to the cluster:

```sh
cd $REPO/gallery
qkube use portal-backend.quickube.sh
./install-blocks.sh kblocks/workload
```

Once `Workload` is installed, we can install the backend itself:

```sh
cd $REPO
./install.sh dev
```

### Block Gallery Installation

Next, let's install _all_ the blocks to the demo cluster:

```sh
cd $REPO/gallery
qkube use kblocks-demo.quickube.sh
./install-blocks.sh
```

> If you wish to only install a single block, you can do it like this:
>
> ```sh
> cd $REPO/gallery
> qkube use kblocks-demo.quickube.sh
> ./install-blocks.sh kblocks/cron-job
> ```

## Local installation

If you want to test the portal locally, you can use `kind` to setup the environment.

### 0. Docker settings

Go to Docker Desktop settings and under **Resources** set:

- CPU limit: 10
- Memory limit: 20GB
- Swap: 3GB
- Virtual disk limit: 800GB

Thank you.

### 1. Clone repository

Clone this repository and set `$REPO` to point to the directory:

```sh
git clone git@github.com:winglang/portal
cd portal
npm install
export REPO=$PWD
```

### 2. Install `kind`

Install kind (v0.25.0 or above):

```sh
brew install kind
```

Then, make sure Docker is running and create a kind cluster:

```sh
./scripts/reinstall-kind.sh
```

### 3. Download and install secrets

Create a directory for the secrets:

```sh
mkdir $HOME/kblocks-demo-secrets
cd $HOME/kblocks-demo-secrets
export SECRETS=$PWD
cd $REPO
```

We will refer to this directory as `$SECRETS` throughout the document.

Now, download all the secret files from the [1Password secret] to the secrets directory.

Setup all of the secrets and certs to your kind cluster:

```sh
KBLOCKS_SYSTEM_ID=local ./gallery/scripts/install-gallery-secrets.sh $SECRETS/kblocks-gallery.env
./scripts/install-secrets.sh $SECRETS/portal.env
./scripts/install-cert.sh $SECRETS/kblocks_io.key $SECRETS/kblocks_io.pem
```

### (Optional) Preload images

If you have pulled these images into your local docker (using `docker pull`), you may now load them into your kind cluster

```sh
kind load docker-image wingcloudbot/kblocks-worker:0.4.68
kind load docker-image wingcloudbot/kblocks-control:0.4.68
kind load docker-image wingcloudbot/kblocks-operator:0.4.68
```

### 4. Install the Workload block

```sh
cd gallery
./install-blocks.sh kblocks/workload
```

### 5. Install the portal frontend and backend

Build the portal:

```sh
cd ..
npm install
npm run build
```

First, we need to wait and make sure all blocks are running:

```sh
kubectl get pods -n kblocks
```

Wait for all pods to be READY.

Then, install the portal to your local cluster. This script will build your frontend and backend and then install them to your cluster.

```sh
./install.sh
```

### 6. Modify your `/etc/hosts` file

Next, modify your `/etc/hosts` file to include the following lines:

```
127.0.0.1 localhost.kblocks.io
127.0.0.1 argo.localhost.kblocks.io
127.0.0.1 voting.localhost.kblocks.io
```

Now the portal should be available at [https://localhost.kblocks.io](https://localhost.kblocks.io).

### 7. Install blocks gallery

Then, install the gallery blocks so they would refer to the local backend:

```sh
./gallery/install-blocks.sh
```

### 8. Deploy demo resources

First, we need to wait and make sure all blocks are running:

```sh
kubectl get pods -n kblocks
```

Next, we will add a bunch of resources that we use for our demo, including ArgoCD:

```sh
cd demo
./install.sh
```

### 9. Run the dev script

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

[1Password secret]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com
