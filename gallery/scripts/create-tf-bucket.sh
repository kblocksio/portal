#!/bin/sh
set -euo pipefail

#
# Required environment variables:
#
# - TF_BACKEND_BUCKET
# - TF_BACKEND_REGION
# - TF_BACKEND_KEY
# - TF_BACKEND_DYNAMODB
#

AWS_PROFILE=${AWS_PROFILE:-default}



if [ "$TF_BACKEND_REGION" != "us-east-1" ]; then
  aws s3api create-bucket --profile $AWS_PROFILE --region $TF_BACKEND_REGION --bucket $TF_BACKEND_BUCKET --create-bucket-configuration LocationConstraint=$TF_BACKEND_REGION
else
  aws s3api create-bucket --profile $AWS_PROFILE --region $TF_BACKEND_REGION --bucket $TF_BACKEND_BUCKET
fi

aws s3api put-bucket-versioning --profile $AWS_PROFILE --region $TF_BACKEND_REGION --bucket $TF_BACKEND_BUCKET --versioning-configuration Status=Enabled
aws dynamodb create-table       --profile $AWS_PROFILE --region $TF_BACKEND_REGION --table-name $TF_BACKEND_DYNAMODB --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST

echo "Terraform bucket created: $TF_BACKEND_BUCKET"
