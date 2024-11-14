# Repository
Manage and configure GitHub repositories as native Kubernetes objects.

## Options
- **name (required)**: The name of the repository.
- **owner (required)**: The owner of the repository.
- **public**: Specifies if the repository is public. Defaults to `true`.
- **files**: An optional array of file objects to be added to the repository. Each file object can have:
  - **path (required)**: The path of the file in the repository.
  - **content (required)**: The content of the file.
  - **readonly**: Specifies if the file is immutable. Defaults to `true`.
- **tags**: An optional array of tags/releases to be created for the repository.

## Examples in Kubernetes Manifests

### Example 1: Create a public repository with files
```yaml
apiVersion: acme.com/v1
kind: Repository
metadata:
  name: example-repository

name: example-repository
owner: example-owner
public: true
files:
  - path: "README.md"
    content: "# Example Repository\nThis is an example."
    readonly: true
  - path: "CONTRIBUTING.md"
    content: "# Contributing\nPlease contribute to this repository."
    readonly: false
```

### Example 2: Create a private repository with tags
```yaml
apiVersion: acme.com/v1
kind: Repository
metadata:
  name: private-repository

name: private-repository
owner: example-owner
public: false
tags:
  - v1.0.0
  - v2.0.0
```

## Resources
- GitHub Repository
- GitHub Repository Files (if provided)
- GitHub Releases (if tags are provided)

## Behavior
The `Repository` resource is implemented by creating a Wing object named `Repository` and synthesizing it into Kubernetes manifests. Once the resource is applied to the cluster, the Kblocks controller reconciles the cluster state with your desired state by converting the object into an instantiation of the `Repository` object, passing the Kubernetes object desired state as the `RepositorySpec` properties to the new object. Resources created by this custom resource are associated with the parent custom resource and tracked by it.