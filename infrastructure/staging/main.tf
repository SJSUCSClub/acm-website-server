provider "aws" {
  region = "us-west-2"
  profile = "AcmApplicationTerraformRoleForStagingEnvironment"
}

module "media_storage" {
  source = "./media-storage"

  acm_application_server_role_arn = data.aws_iam_role.acm_application_server_role.arn
}
