include "root" {
    path = find_in_parent_folders()
}

terraform {
    module "s3_data_store_bucket" {
        source  = "terraform-aws-modules/s3-bucket/aws"
        version = "4.5.0"
        bucket = "acmwebsite-dev-588738592350-us-west-2"
        server_side_encryption_configuration = {
          rule {
            apply_server_side_encryption_by_default {
              sse_algorithm = "AES256"
            }
          } 
        }
        attach_public_policy = false
        block_public_acls = false
        ignore_public_acls = false
        restrict_public_buckets = false

        policy = jsonencode({
          Version = "2012-10-17"
          Statement = [
            {
              Effect    = "Allow"
              Principal = "*"
              Action    = "s3:GetObject"
              Resource  = "${module.s3_data_store_bucket.s3_bucket_arn}/*"
            }
          ]
        })
    }
}
