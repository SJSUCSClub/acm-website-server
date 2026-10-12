provider "aws" {
  region  = "us-west-2"
  profile = "AcmApplicationTerraformRoleForProdEnvironment"
}

module "media_storage" {
  source = "./media-storage"

  acm_application_server_role_arn = aws_iam_role.server.arn
}
