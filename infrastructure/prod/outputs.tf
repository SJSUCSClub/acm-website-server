# Values for .env.prod
output "notification_service_queue_url" {
  description = "NOTIFICATION_SERVICE_QUEUE_URL"
  value       = aws_sqs_queue.notifications.url
}

output "aws_role_arn" {
  description = "AWS_ROLE_ARN"
  value       = aws_iam_role.server.arn
}

output "s3_bucket_name" {
  description = "S3_BUCKET_NAME"
  value       = module.media_storage.media_storage_name
}

output "server_user_name" {
  description = "IAM user to create the AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY pair for"
  value       = aws_iam_user.server.name
}
