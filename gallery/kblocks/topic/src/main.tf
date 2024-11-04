resource "aws_sns_topic" "my_topic" {
  name = var.topicName
}

output "topicArn" {
  value = aws_sns_topic.my_topic.arn
  description = "The ARN (Amazon Resource Name) of the SNS topic"
}

provider "aws" {
  region = var.region
}
