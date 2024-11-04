# Service
A Kubernetes custom resource for managing services linked to GitHub repositories.

## Options
- `repo` (object, required): Defines the GitHub repository details.
  - `name` (string, required): The name of the GitHub repository.
  - `owner` (string, required): The organization or user that owns the repository.
  - `public` (boolean, optional): Specifies if the repository is public. Defaults to `true`.
- `configOnly` (boolean, optional): If set to true, creates a configuration-only repository (without Dockerfile). Defaults to `false`.

## Examples in Kubernetes Manifests

### Example: Basic Service
```yaml
apiVersion: acme.com/v1
kind: Service
metadata:
  name: my-service
repo:
  name: sample-repo
  owner: sample-org
```

### Example: Service with Config Repository
```yaml
apiVersion: acme.com/v1
kind: Service
metadata:
  name: my-config-service
repo:
  name: config-repo
  owner: sample-org
configOnly: true
```

## Resources
- **Repository**: Manages the service repository in GitHub.
- **ArgoCD Application**: Deployed in the `argocd` namespace to sync the repo with the cluster.
- **ArgoCD ApplicationSet**: Handles pull request-related deployments for the repository.
- **ArgoCD Secret**: Stores GitHub authentication details in the `argocd` namespace.

## Behavior
The `Service` resource automates the management of the GitHub repository, along with its deployment configuration in Kubernetes. It leverages ArgoCD for continuous deployment and keeps the cluster synced with the desired state reflected in the Kubernetes objects.