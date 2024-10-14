# Kblocks Portal

## Prerequisites

* [docker](https://www.docker.com/)
* [kubectl](https://kubernetes.io/docs/reference/kubectl/)
* [helm](https://helm.sh/)
* [skaffold](https://skaffold.dev/)
* [quickube](https://github.com/winglang/quickube)

## Setup

#### Install dependencies

```sh
npm i
```

#### Access our cluster

Install the [quickube](https://github.com/winglang/quickube) CLI (see instructions in README)
switch to the `portal-backend` cluster:

```sh
qkube use portal-backend.quickube.sh
```

#### Sign in to Docker Hub

We are using Docker Hub to publish images. Log in with the `wingcloudbot` user and password from [1password]:

```sh
docker login -u wingcloudbot
Password: <SEE 1PASSWORD>
```

[1password]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=lzd45n6b5mraghh53hnq74hccy&h=wingcloud.1password.com

## Local development

Run `npm run dev` from the root and it will connect to the qkube cluster that's in your current
context.

## Remote development

Deploy to the cluster:

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

## Deploying to a fresh cluster

### Install the Workload kblock

In the kblocks-gallery repo, run:

```sh
./scripts/install-secrets.sh
./install.sh kblocks/workload
```

### Deploy the Portal

In this repo (all secrets are in 1password), run:

```sh
./scripts/install-secrets.sh
./scripts/install-certs.sh <path-to-key-file> <path-to-cert-file>
./install.sh
```
