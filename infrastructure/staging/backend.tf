terraform {
  required_version = ">= 1.10"
  backend "s3" {
    bucket       = "terraform-state-storage-440744215929-us-west-2"
    encrypt      = true
    use_lockfile = true
    key          = "service/acm-website/staging/terraform.tfstate"
    region       = "us-west-2"
  }
}
