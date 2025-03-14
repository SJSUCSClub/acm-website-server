module "media_storage" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.5.0"
  bucket  = "acm-website-media-storage-staging-440744215929-us-west-2"
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  block_public_acls       = false
  ignore_public_acls      = false
  restrict_public_buckets = false
  block_public_policy     = false

  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Server Access"
        Effect = "Allow"
        Principal = {
          AWS = var.acm_application_server_role_arn
        }
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = ["${module.media_storage.s3_bucket_arn}/*", "${module.media_storage.s3_bucket_arn}"]
      },
      {
        Sid       = "All Read Access"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${module.media_storage.s3_bucket_arn}/*"
      }
    ]
  })
}
