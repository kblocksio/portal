# Run
A Kubernetes Custom Resource Definition (CRD) for managing job executions.

## Options

- **retries**: *(integer)* The number of retries to attempt before giving up. Default value is `10`.
- **container**: *(object)* The container specifications for the job, including fields like `name`, `image`, `command`, and more. This is a required field.
- **serviceAccountName**: *(string, optional)* Specifies the service account to be used by the job's pod. If not set, a new service account will be created by default.

### Container Specification
- **image**: *(string)* The Docker image to be used for the container. Required field.
- **command**: *(array of strings, optional)* The command to run in the container.
- **env**: *(object, optional)* Environment variables for the container, which can be sourced from ConfigMaps and Secrets.
- **envFrom**: *(array, optional)* Environment variables for the container that are sourced from a ConfigMap or Secret.
- **port**: *(number, optional)* Port number on which the container will be exposed.
- **readiness**: *(array of strings, optional)* Readiness checks to determine if the container is ready to receive traffic.

### Policy Specifications
- **allow**: *(array, optional)* Permissions for the resources within the cluster specified by apiGroups, resource names, and allowed verbs (actions).
- **allowCluster**: *(array, optional)* Cluster-wide permissions specified similarly to `allow`.

## Examples in Kubernetes Manifests

### Example: Simple Run
```yaml
apiVersion: acme.com/v1
kind: Run
metadata:
  name: simple-run
spec:
  retries: 5
  container:
    image: nginx
    name: nginx-container
```

### Example: Run with Custom Service Account
```yaml
apiVersion: acme.com/v1
kind: Run
metadata:
  name: custom-sa-run
spec:
  retries: 3
  serviceAccountName: custom-sa
  container:
    image: busybox
    name: busybox-container
    command: ["sleep", "3600"]
```

## Resources
- **Job**: Defines the execution environment for the specified container.
- **ServiceAccount**: Creates a service account if `serviceAccountName` is not specified.

## Behavior
The `Run` resource encapsulates a job execution environment by defining a Kubernetes Job resource along with an optional service account. The job resource handles retry logic and can be customized with environment variables and commands. When a `Run` CRD is applied, it is reconciled by the Kblocks controller which uses this specification to maintain the desired state of job executions within the cluster.