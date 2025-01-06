Welcome! We are exited to invite you to the Kblocks Early Access program. In order for us to be able
to onboard you to the program.

### Access your portal

Based on the details you provided us on the onboarding call, we’ve created a Kblocks instance for
your organization:

- **Organization name**: Acme, Inc.
- **Domain**: `acmehq.kblocks.io`
- **Allowed GitHub users**: x, y, z

Go to https://acmehq.kblocks.io and you should be able to sign in with your GitHub
credentials.

> TODO: instructions for self-hosted installations

### Adding Slack notifications

Go to your portal and under Settings » Slack, click "Add Slack". This will open a modal where you
can select the Slack workspace you want to add notifications for. This will install the Kblocks
app in your workspace.

### Adding a cluster

Blocks can be installed into any Kubernetes cluster. The kblocks operator securely sends events to
the Kblocks backend.

Go to your portal and under Clusters » click "Add new cluster..."

Select an ID for your cluster (e.g. `dev`).

Next, you will be able to select if you want to enable apply of changes to resources in this cluster
directly from the portal or not.

In most production environments, where GitOps is used, you will want to disable this option and only
create resources through a production pipeline such as ArgoCD, Flux, etc. In this case, when users
click "New Resource" or "Edit Resource" they will be able to edit the resource attributes in the UI
but they will get a YAML that they can copy and paste to their repository.

For testing and development environments, you can enable this option, which will allow users to
apply changes directly to the cluster from the portal.

Click "Get install command".

You will see a command that you can copy and run in your terminal:

```bash
helm install oci://dockerhub.... \
  --wait
  --set system_id=xxx \
  --set access=read_write \ # or read_only
  --set api=acmehq.kblocks.io \
  --create-namespace \
  -n kblocks
  kblocks...
```

Copy this command and run it against the cluster you wish to add.

This command will install the following on your cluster:

- Secret which includes:
    - `KBLOCKS_SYSTEM_ID` with the selected cluster ID.
    - `KBLOCKS_BACKEND` points to `acmehq.kblocks.io`
    - `KBLOCKS_ACCESS` with the selected access level (`read_write` or `read_only`)
    - `KBLOCKS_PUBSUB_KEY` with a tenant-specific API token
- Controllers for the system block: `kblocks.io/v1.Cluster`
- An instance of a `Cluster` object that represents this particular cluster.

Once the command finished successfully, you should be able to see your new cluster in the portal
under the “Clusters” view.

Congrats!

### Creating your first block

Let’s create your first block and install it to a cluster.

Install the `kb` CLI:

```sh
curl http://get.kblocks.io | sh
```

Check that the CLI is installed:

```sh
$ kb --version
0.444.4
```

Our first block will be called `blocky` a simple `helm` chart that installs a `Deployment` running a
container image on your cluster.

Create a new block project that uses the `helm` engine:

```sh
kb init helm blocky --plural ...
```

Now, edit README, change schema file, update the helm templates.

We are ready to install our block to a cluster.

```jsx
cd my-block
kb install --wait -n kblocks
```

This will install a controller for the `blocky` block into the `kblocks` namespace on your cluster.

You can verify that the controller is running by checking the `kblocks` namespace:

```sh
kubectl get pods -n kblocks
```

You should see a pod running for the controller:

```sh
kblocks-blocky-controller-7fcc75d778-kk4b6             1/1     Running   0          4d1h
```

Once your block is installed, you should be able to find it in the portal catalog as well.

Go to the "Catalog" view in your portal and you should see your block listed there with it's
documentation and all the other shit.

### Creating an instance of our block

You can create an instance of your block either via the portal or through the Kubernetes control
plane. This can be done using any cloud-native tool such as `kubectl`, `kustomize`, `helm`, ArgoCD,
etc.

When creating the instance of a block, you will need to select a cluster that the block will be
installed into.

If the portal has read-write access to this cluster, you will be able to create an instance of your
block via the portal.

If the portal has read-only access to this cluster, you will only be able to create a YAML that you
can copy and paste to the cluster.

> more instructions here + links to the create instance UI

### Example blocks

You can find some example blocks in the
[kblocks-examples](https://github.com/kblocksio/kblocks-examples) repository.

These blocks are not officially supported by Kblocks. They are just here to give you some ideas on
how to build your own blocks. Feel free to fork them and modify to your needs and install them in
your clusters.

---

If you have any questions or feedback, please let us know!

### Updating your block implementation

...

## Roadmap

The following features are not included in the initial release but are planned for the future:

- [ ] Role-based access control for projects and block types, etc
- [ ] Full GitOps integration - creation of pull requests for changes to resources, etc
- [ ] Multiple slack channels
- [ ] Escape hatches
- [ ] Drift detection and alerting
- [ ] Block actions