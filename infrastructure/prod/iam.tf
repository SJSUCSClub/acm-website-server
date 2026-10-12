# The server signs in with this user's access key, then assumes the server role
# (see server/src/lib/aws/iam.ts). The access key itself is created by hand so
# the secret never lands in terraform state.
resource "aws_iam_user" "server" {
  name = "acm-website-server-prod"
}

resource "aws_iam_role" "server" {
  name = "AcmApplicationServerRoleForProdEnvironment"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = aws_iam_user.server.arn }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "server" {
  name = "acm-website-server-prod"
  role = aws_iam_role.server.id

  # S3 access is granted by the bucket policy in ./media-storage, not here.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "SendNotifications"
        Effect   = "Allow"
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.notifications.arn
      },
      {
        Sid    = "ManageEmailTemplates"
        Effect = "Allow"
        Action = [
          "ses:ListTemplates",
          "ses:CreateTemplate",
          "ses:GetTemplate",
          "ses:UpdateTemplate",
          "ses:DeleteTemplate",
        ]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_user_policy" "server_assume_role" {
  name = "assume-server-role"
  user = aws_iam_user.server.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sts:AssumeRole"
      Resource = aws_iam_role.server.arn
    }]
  })
}
