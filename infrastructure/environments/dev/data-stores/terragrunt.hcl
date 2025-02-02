include "root" {
    path = find_in_parent_folders()
}

terraform {
    module "s3" {
        source  = "terraform-aws-modules/s3-bucket/aws"
        version = "4.5.0"
        bucket = "acmwebsite-dev-588738592350-us-west-2"
        server_side_encryption_configuration = {
        }
    }
}