remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket = get_env("TF_VAR_BACKEND_BUCKET")

    key = "service/acm-website/${path_relative_to_include()}/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = get_env("TF_VAR_DYNAMODB_TABLE")
  }
}
generate "provider" {
  path = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
        provider "aws" {
            region = "us-west-2"
            assume_role {
              role_arn = "arn:aws:iam::588738592350:role/AcmApplicationRoleForLocalTerraform"
              session_name = "terragrunt-AcmApplicationRoleForLocalTerraform-session"
            }
        }
    EOF
}
