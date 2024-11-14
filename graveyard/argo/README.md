# Argo
Manage ingress configurations using a custom Kubernetes resource.

## Options

### Required Fields
- **ingressHost**: The host to use for the ingress. This field must be a valid hostname that routes to your ArgoCD application. Ensure this hostname is resolvable and correctly configured in DNS to point to your cluster.

### Optional Fields
Currently, there are no additional optional fields.

## Examples in Kubernetes Manifests

### Example 1: Basic Ingress Configuration
```yaml
apiVersion: acme.com/v1
kind: Argo
metadata:
  name: example-argo
spec:
  ingressHost: argo.example.com
```

### Example 2: Custom Host Configuration
```yaml
apiVersion: acme.com/v1
kind: Argo
metadata:
  name: custom-argo
spec:
  ingressHost: custom-argo.example.org
```

## Resources
This custom resource does not explicitly create additional Kubernetes resources by itself. It requires the ingress host to facilitate the routing of traffic to the ArgoCD application.

## Behavior
When an `Argo` resource is created, it configures the specified ingress host for the ArgoCD setup. This is crucial for exposing your ArgoCD application to the desired domain, allowing you to access your application externally. Make sure that your ingress controllers and firewall rules allow traffic to your specified ingress host.