# PulumiOllama
An example building block that provisions AWS infrastructure using Pulumi.

## Options
Currently, there are no options directly configurable via the custom resource schema.

## Examples in Kubernetes Manifests
### Example 1: Basic Setup
```yaml
apiVersion: pulumi.kblocks.io/v1
kind: PulumiOllama
metadata:
  name: basic-ollama
```

### Example 2: Custom Setup with Annotations (future scope)
```yaml
apiVersion: pulumi.kblocks.io/v1
kind: PulumiOllama
metadata:
  name: custom-ollama
  annotations:
    custom-annotation: value
```

## Resources
- **EC2 Instance**: Named `Instance` with `ami` and `instanceType` configured.
- **IAM Role**: Named `Role`, attached to `AmazonS3ReadOnlyAccess` policy.
- **VPC**: Named `Vpc` with enabled DNS support.
- **Subnet**: Named `Subnet`, associated with an Internet Gateway.
- **Security Group**: Configured to allow SSH, HTTP, and custom TCP traffic.

## Behavior
This resource deploys an EC2 instance in a specified VPC subnet with IAM roles and policies attached to facilitate access to AWS resources. The instance is launched with public IP accessibility and pre-configured security group rules for SSH and HTTP access. The initialization scripts ensure the instance is properly configured upon startup.