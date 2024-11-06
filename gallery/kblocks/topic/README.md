# Topic

Manage SNS topics through Kubernetes Custom Resources.

## Options

- **topicName**: `string` (Required) - The name of the SNS topic. This field is critical as it directly sets the name of the topic in AWS.

- **region**: `string` (Required) - The AWS region where the topic should be created. This determines the geographic location where your topic resources reside and can affect latency.

## Examples in Kubernetes Manifests

### Example 1: Create a simple SNS topic

This example shows how to create an SNS topic named `my-topic` in the `us-west-2` region.

```yaml
apiVersion: acme.com/v1
kind: Topic
metadata:
  name: my-topic
topicName: my-topic
region: us-west-2
```

### Example 2: Create another SNS topic

This example demonstrates creating a topic named `second-topic` in the `us-east-1` region.

```yaml
apiVersion: acme.com/v1
kind: Topic
metadata:
  name: second-topic
topicName: second-topic
region: us-east-1
```

## Resources

- **aws_sns_topic**: This resource will be named based on the `topicName` field of the Topic custom resource.

## Behavior

This resource is implemented by applying a Terraform configuration. Once the resource is applied to the cluster, the Kblocks controller will reconcile the state of the cluster with the desired state by converting the object into Terraform input variables that are referenced by the Terraform configuration. The resources created will be associated with the parent custom resource and tracked by it.

The Terraform configuration consists of the following files:

- **main.tf**: Defines the AWS SNS topic resource and its output.
- **variables.tf**: Contains the variable definitions for the topic name and region.

The `aws_sns_topic` resource is created using the `topicName` and `region` variables passed to the Terraform configuration. The output `topicArn` is then exposed and tracked under the `status` subresource of the custom resource.