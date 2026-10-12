# Queue the server publishes email notifications to. The notification service
# (separate from this repo) consumes it and sends the mail through SES.
resource "aws_sqs_queue" "notifications_dlq" {
  name                      = "acm-website-notifications-dlq-prod"
  sqs_managed_sse_enabled   = true
  message_retention_seconds = 1209600 # 14 days
}

resource "aws_sqs_queue" "notifications" {
  name                    = "acm-website-notifications-prod"
  sqs_managed_sse_enabled = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notifications_dlq.arn
    maxReceiveCount     = 5
  })
}
