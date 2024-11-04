# Qkube
Qkube is a Custom Resource Definition (CRD) for managing Kubernetes clusters across various cloud providers. It allows developers to define and manage their clusters with a specific size, provider, and deployment region.

## Options
- **name** (string): A unique name for your cluster. This field is required.
- **size** (string): The size of the cluster. Specify the cluster size based on requirements (e.g., small, medium, large). This field is optional.
- **provider** (string): The cloud provider to use (e.g., AWS, GCP, Azure). This field is optional and defaults to a pre-defined provider if not set.
- **region** (string): The region to deploy the cluster. Choose your preferred region (e.g., us-east-1, europe-west1). This field is optional and defaults to a pre-set region.

## Examples in Kubernetes Manifests
```yaml
apiVersion: acme.com/v1
kind: Qkube
metadata:
  name: example-cluster
name: my-cluster
size: medium
provider: AWS
region: us-west-2
```

```yaml
apiVersion: acme.com/v1
kind: Qkube
metadata:
  name: another-cluster
name: another-cluster-name
size: large
provider: GCP
region: europe-west1
```

```yaml
apiVersion: acme.com/v1
kind: Qkube
metadata:
  name: minimal-cluster
name: minimal-cluster
size: small
```

## Resources
This custom resource creates a Kubernetes cluster resource configured based on the specified attributes like size, provider, and region.

## Behavior
The Qkube resource allows developers to easily define and manage Kubernetes clusters by specifying the essential attributes via the resource manifest. This enhances flexibility and efficiency in deploying clusters across different cloud providers.