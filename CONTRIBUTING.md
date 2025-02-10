# Kblocks Portal

## Local Setup and Development

### Prerequisites

- [Docker](https://www.docker.com/)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [Helm](https://helm.sh/)
- [Skaffold](https://skaffold.dev/)
- [Quickube](https://github.com/winglang/quickube)

### 1. Set Up Your Cluster

This system can be installed into any standard Kubernetes cluster.

If you want to test the portal locally, you can use [`kind`](https://kind.sigs.k8s.io/) to set up your environment.

1. Open Docker Desktop settings and under **Resources**, configure:

   - CPU limit: 10
   - Memory limit: 20 GB
   - Swap: 3 GB
   - Virtual disk limit: 800 GB

2. Install `kind` (v0.25.0 or above):

   ```sh
   brew install kind
   ```

3. Make sure Docker is running, then create a kind cluster:

   ```sh
   ./scripts/reinstall-kind.sh
   ```

### 2. Log In to Docker Hub

We use Docker Hub to publish images. Log in with the `wingcloudbot` user and password from [1Password]:

```sh
docker login -u wingcloudbot
Password: <SEE 1PASSWORD>
```

[1Password]: https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=lzd45n6b5mraghh53hnq74hccy&h=wingcloud.1password.com

### 3. Build the Frontend and Backend

```sh
npm i
npm run build
```

### 4. Install Secrets

We use [git-crypt](https://github.com/AGWA/git-crypt) to encrypt secrets in the repository.

1. Install git-crypt:

   ```sh
   brew install git-crypt
   ```

2. Download the `git-crypt-key` master key from [1Password](https://start.1password.com/open/i?a=E2C6K5R5T5BZFDLNI34WC55CCU&v=gb5pxjy6oqlfg4rbxjfiwapmwy&i=t2dmpkwt5hufldsxzhnnw43d5i&h=wingcloud.1password.com).

3. Unlock the repository:

   ```sh
   git-crypt unlock /path/to/git-crypt-key
   ```

4. Set up all secrets and certificates in your cluster. Refer to
   [docs/enabling-slack-notifications.md](docs/enabling-slack-notifications.md) if you want to enable Slack notifications.

   > **If installing to a non-local cluster, replace** `KBLOCKS_SYSTEM_ID` with the appropriate value:

   ```sh
   export KBLOCKS_SYSTEM_ID=local
   ./scripts/install-all-secrets.sh
   ```

### 6. Install the Portal

Install the portal to your cluster. This command is useful for local iteration:

```sh
./install.sh
```

### 7. (Optional) Install Demo Block Gallery

If you wish, install the demo block gallery (not required to be in the same cluster as the portal):

```sh
./gallery/install-blocks.sh
```

Then wait for all pods to be READY:

```sh
kubectl get pods -n kblocks
```

### 8. Deploy Demo Resources

```sh
cd demo && ./install.sh && cd ..
```

Afterwards, the portal should be available at [https://localhost.kblocks.io](https://localhost.kblocks.io).

---

## Local Development

1. **Update Environment Variables**

   In `apps/web/.env`:

   ```
   VITE_BACKEND_URL=http://localhost:3001
   VITE_SKIP_AUTH=true
   ```

   In `apps/server/.env`:

   ```
   KBLOCKS_PUBSUB_HOST=localhost
   KBLOCKS_PUBSUB_PORT=6379
   KBLOCKS_PUBSUB_KEY=pass1234
   ```

   You can copy these from the respective `.env.example` files.

2. **Start the Portal Locally**

   At the root of the repository:

   ```sh
   npm run dev
   ```

   This will start both the backend and frontend locally, and forward the Redis ports from the kind cluster.  
   Access the portal at: [http://localhost:5173](http://localhost:5173).

### Switching Between Local and Staging

- **Check the current cluster context**:

  ```sh
  kubectl config current-context
  # should be kind-kind for local
  ```

- **Switch to the staging cluster**:

  ```sh
  qkube use staging.quickube.sh
  ```

- **Switch back to the local cluster**:

  ```sh
  kubectl config use-context kind-kind
  ```

That’s it! Have fun and happy building!
