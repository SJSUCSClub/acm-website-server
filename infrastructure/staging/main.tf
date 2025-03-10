provider "aws" {
  region = "us-west-2"
  assume_role {
    role_arn     = "arn:aws:iam::440744215929:role/AcmApplicationTerraformRoleForStagingEnvironment"
    session_name = "acm-application-staging-role"
  }
}

module "media_storage" {
  source = "./media-storage"

  acm_application_server_role_arn = data.aws_iam_role.acm_application_server_role.arn
}
