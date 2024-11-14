# Website
The `Website` custom resource allows you to define and manage web applications in your Kubernetes cluster using a Helm chart.

## Options
- **image** (string): *Required*. The Docker image to deploy. This is the container image that will serve your web application.
- **backend** (string): *Required*. The backend URL that the frontend web application will communicate with. This is typically an internal service or API endpoint within your cluster.
- **route** (string): *Required*. The route at which the website will be accessible. This is the path portion of the URL where your application can be accessed.

## Examples in Kubernetes Manifests
### Example: Basic Website
This example shows how to create a basic `Website` resource.
```yaml
apiVersion: acme.com/v1
kind: Website
metadata:
  name: my-website

image: nginx:latest
backend: http://backend-service
route: /my-website
```

### Example: Another Website
This example demonstrates another usage with different values.
```yaml
apiVersion: acme.com/v1
kind: Website
metadata:
  name: another-website

image: httpd:latest
backend: http://another-backend-service
route: /another-website
```

## Resources
- **Workload**: A custom resource named `<name>-workload` in the same namespace with specs translated from the `Website` resource.

## Behavior
The `Website` custom resource is implemented through a Helm chart, which is a collection of templates and values used to generate Kubernetes manifests. Once the `Website` resource is applied to the cluster, the Kblocks controller will reconcile the state of the cluster with the desired state by converting the object into Helm values. The resources created (such as the `Workload`) will be associated with the parent `Website` custom resource and tracked by it.