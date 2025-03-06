variable "topicName" {
  description = "The name of the topic"
  type        = string
  default     = null
  nullable    = true
}

variable "region" {
  description = "Which AWS region to deploy in"
  type        = string
  nullable    = false
}

variable "encrypted" {
  description = "Whether the SNS topic should be encrypted. Defaults to false."
  type        = bool
  default     = false
}

variable "fifo" {
  description = "Whether the SNS topic should be an Amazon SNS FIFO topic. Defaults to false."
  type        = bool
  default     = false
}

variable "displayName" {
  description = "The display name of the SNS topic"
  type        = string
  default     = null
  nullable    = true
}

provider "aws" {
  region = var.region
}

resource "aws_sns_topic" "my_topic" {
  name = var.topicName
  display_name = var.displayName
  kms_master_key_id = var.encrypted ? "alias/aws/sns" : null
  fifo_topic = var.fifo
}

output "topicArn" {
  value = aws_sns_topic.my_topic.arn
  description = "The ARN (Amazon Resource Name) of the SNS topic"
}

data "aws_region" "current" {}

output "awsConsole" {
  value       = "https://${data.aws_region.current.name}.console.aws.amazon.com/sns/v3/home?region=${data.aws_region.current.name}#/topic/${aws_sns_topic.my_topic.arn}"
  description = "The URL to the AWS console for this topic"
}

