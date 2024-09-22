# Kblocks Portal

## Setup

### Install dependencies

```sh
npm i
```

### Access to our cluster

Install the [quickube](https://github.com/winglang/quickube) CLI (see instructions in README)
switch to the `portal-backend` cluster:

```sh
qkube use portal-backend.quickube.sh
```

### Local development

You should be able to run `npm run dev` from the root and it will connect to the qkube cluster
that's in your current context.


### Deploy to portal-backend

#### Login to Docker Hub

We are using Docker Hub to publish images. Log in with the `wingcloudbot` user and password from [1password]:

```sh
docker login -u wingcloudbot
Password: <SEE 1PASSWORD>
```

[1password]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=lzd45n6b5mraghh53hnq74hccy&h=wingcloud.1password.com

#### Install

Run this script to build the image, push it to Docker Hub and upgrade the Helm chart.

```sh
./install.sh
```

### Remote Development

There's an initial [skaffold](https://skaffold.dev/) configuration.

You can use it to run the app and tail the logs:

```sh
skaffold run --tail
```

Or even watch for changes with hot reloading:

```sh
skaffold dev
```
