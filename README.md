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

* Frontend is hosted in Vercel.
* Backend is deployed on a quickube cluster by the name of `portal-backend.quickube.sh`.
* Block gallery ([source](https://github.com/winglang/kblocks-gallery)) is deployed on a quickube cluster by the name of `kblocks-demo.quickube.sh`.

We use [DNSimple](https://dnsimple.com/a/137210/domains/kblocks.io):

* The root `A` record (`kblocks.io`) points to Vercel
* The subdomain `api.kblocks.io` has a CNAME that points to `portal-backend.quickube.sh`.
* Vercel rewrites all requests to `kblocks.io/api` to `api.kblocks.io/api`, so we don't need CORS.

***Do I need to modify the DNS records if I provision a new cluster?*** Probably not. Technically,
if a new cluster is provisioned, there is no need to change any DNS configuration as long as the
cluster name is `portal-backend.quickube.sh`. If you change it, then the CNAME needs to be updated
accordingly (bear in mind DNS propagation and cache).

### Repositories

Clone the repositories:

```sh
git clone git@github.com:winglang/portal
cd portal
export PORTAL=$PWD
cd ..
```

And clone the gallery repository:

```sh
git clone git@github.com:winglang/kblocks-gallery
cd kblocks-gallery
export GALLERY=$PWD
cd ..
```

We will use `$PORTAL` and `$GALLERY` to refer to these directories throughout this document.

### Installing Secrets

The following steps need to be performed once in order to install configuration and secrets to our
clusters.

Configuration and secrets are all managed together in `.env` files that can be downloaded from a [1Password secret] and
stored in Kubernetes secrets within the clusters. These secrets are referenced by pods.

First, let's create a directory for our secrets:

```sh
mkdir $HOME/kblocks-demo-secrets
cd $HOME/kblocks-demo-secrets
export SECRETS=$PWD
```

We will refer to this directory as `$SECRETS` throughout the document.

Now, download all the secret files from the [1Password secret] to this directory. We expect the
following files:

* `kblocks-gallery.env` - environment for kblocks-gallery
* `portal.env` - environment for portal-backend
* `kblocks_io.key` and `kblocks_io.pem` - SSL certificates for kblocks.io

And we are ready to install the secrets:

1. Install the **gallery secrets** to the `kblocks-demo.quickube.sh` cluster:

    ```sh
    qkube use kblocks-demo.quickube.sh
    KBLOCKS_SYSTEM_ID=demo $GALLERY/scripts/install-gallery-secrets.sh $SECRETS/kblocks-gallery.env
    ```

3. We will also install the **gallery secrets** to the `portal-backend.quickube.sh` cluster as well
   because our backend needs the `Workload` block:

    ```sh
    qkube use portal-backend.quickube.sh
    KBLOCKS_SYSTEM_ID=portal-backend.quickube.sh $GALLERY/scripts/install-gallery-secrets.sh $SECRETS/kblocks-gallery.env
    ```

4. Install the **backend secrets** to the `portal-backend.quickube.sh` (these are needed by the
   backend service to operate):

    ```sh
    $PORTAL/scripts/install-secrets.sh $SECRETS/portal.env
    ```

5. Finally, we need to install the SSL certificates to the portal backend cluster as well:

    ```sh
    $PORTAL/scripts/install-cert.sh $SECRETS/kblocks_io.key $SECRETS/kblocks_io.pem
    ```

At this point we should have the two clusters ready for installing the blocks and backend service.

### Backend Installation

Our backend uses the `Workload` block for deployment )(yes, we eat our own dogfood), so before we install the backend
we need to install this block to the cluster:

```sh
cd $GALLERY
qkube use portal-backend.quickube.sh
./install-blocks.sh kblocks/workload
```

Once `Workload` is installed, we can install the backend itself:

```sh
cd $PORTAL
./install.sh dev
```

### Block Gallery Installation

Next, let's install *all* the blocks to the demo cluster:

```sh
cd $GALLERY
qkube use kblocks-demo.quickube.sh
./install-blocks.sh
```

> If you wish to only install a single block, you can do it like this:
> ```sh
> cd $GALLERY
> qkube use kblocks-demo.quickube.sh
> ./install-blocks.sh kblocks/cron-job
> ```

## Local kind installation

If you want to test the portal locally, you can use `kind` to setup the environment.

Install kind, and setup all of the secrets as described in the previous section.
Then, install the blocks so they would refer to the local backend:

```sh
cd $GALLERY
KBLOCKS_HOST=http://portal-backend.default.svc.cluster.local ./install-blocks.sh
```

Then, install the portal in kind mode:

```sh
cd $PORTAL
./install.sh kind
```

That's it. Have fun!

[1Password secret]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com
