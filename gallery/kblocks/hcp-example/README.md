# HcpExample Block

This block demonstrates how to use HashiCorp Cloud Platform (HCP) to deploy resources to AWS using Terraform.

## Overview

The HcpExample block uses HCP's managed Terraform service to provision and manage AWS resources in a secure and scalable way. It leverages HCP's authentication and state management capabilities while allowing you to define infrastructure as code.

## Prerequisites

- An active HashiCorp Cloud Platform account
- AWS credentials configured
- A valid HCP API token stored in the `TF_TOKEN_app_terraform_io` secret

## Usage

1. Create a new instance of the HcpExample block
2. Configure the required parameters in the values file
3. Apply the block to provision the resources
4. Access the outputs through the block's status

## Configuration

The block accepts configuration through a values file that follows the schema defined in `src/values.schema.json`.

## Outputs

The block exposes the following outputs:

- `myOutput`: Description of the output value

## Security

This block requires access to HCP and AWS. Make sure to:

- Store the HCP API token securely in Kubernetes secrets
- Configure appropriate AWS IAM permissions
- Follow security best practices for infrastructure management

## Additional Resources

- [HashiCorp Cloud Platform Documentation](https://developer.hashicorp.com/hcp)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
