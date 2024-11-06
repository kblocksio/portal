# Portal
The Portal resource is a custom Kubernetes resource designed to manage GitHub repositories and their corresponding Argo CD applications. It helps automate and streamline GitOps workflows by integrating GitHub repositories with Argo CD deployments in your Kubernetes cluster.

## Options

### Required Fields
- **repo**: Defines the repository specification.
  - **name** (string): The name of the GitHub repository. This is a mandatory field and should be the exact name as it appears in GitHub.
  - **owner** (string): The owner of the GitHub repository, representing either a user or an organization. This field is required.

### Optional Fields
- **public** (boolean): Specifies the repository's visibility. If set to `true`, the repository will be public; if omitted or `false`, it will be private. This field is optional, with a default value of `false` if not specified.

## Examples in Kubernetes Manifests

### Example 1: Basic GitHub Repository
```yaml
apiVersion: acme.com/v1
kind: Portal
metadata:
  name: my-portal
spec:
  repo:
    name: my-repo
    owner: my-owner
```

### Example 2: Public Repository
```yaml
apiVersion: acme.com/v1
kind: Portal
metadata:
  name: public-portal
spec:
  repo:
    name: my-public-repo
    owner: public-owner
    public: true
```

### Example 3: Private Repository with Defaults
```yaml
apiVersion: acme.com/v1
kind: Portal
metadata:
  name: private-portal
spec:
  repo:
    name: private-repo
    owner: private-owner
    # public: false (default)
```

## Resources
- **Repository**: The Portal resource creates a repository resource within the Kubernetes cluster that is associated with the specified GitHub repository.
- **Argo CD Application**: Automatically generates an Argo CD application resource that links to the specified repository and manages its deployment status.
- **GitHub Secret**: Sets up the necessary secret in the Argo CD namespace for authentication with GitHub using the provided GitHub token.

## Behavior
The Portal resource automates the creation and management of a GitHub repository and an Argo CD application that tracks the main branch of that repository. It ensures that the Argo CD application is kept in sync with changes to the repository, facilitating continuous delivery. Additionally, the resource handles GitHub authentication by setting up necessary secrets in the Argo CD namespace. If the repository is public, fewer authentication details might be required.