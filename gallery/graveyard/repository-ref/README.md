# RepositoryRef
The RepositoryRef resource allows you to reference existing GitHub repositories as native Kubernetes objects, making it easier to manage and track repositories as part of your Kubernetes deployments.

## Options
- **name** (required): The name of the GitHub repository you wish to reference. This must be a string.
- **owner** (required): The owner of the GitHub repository, typically a GitHub user or organization. This must be a string.
- **data** (optional): An object for storing additional metadata you want to associate with the repository reference. This is a flexible field that can store any key-value pairs you choose.

## Examples in Kubernetes Manifests

Example 1: Basic Repository Reference
```yaml
apiVersion: acme.com/v1
kind: RepositoryRef
metadata:
  name: my-repo-ref
spec:
  name: my-repository
  owner: my-organization
```

Example 2: Repository Reference with Additional Data
```yaml
apiVersion: acme.com/v1
kind: RepositoryRef
metadata:
  name: another-repo-ref
spec:
  name: another-repository
  owner: another-owner
  data:
    branch: main
    team: core-development
```

## Resources
This resource does not create any additional Kubernetes child resources. It functions as a pointer to existing GitHub repositories.

## Behavior
The RepositoryRef resource acts as a simple reference to an existing GitHub repository. It does not initiate any actions or behaviors on its own; instead, it serves as a pointer to help manage and organize repository information within Kubernetes.