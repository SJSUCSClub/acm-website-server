terraform {
  source = "terraform-aws-modules/vpc/aws"
}

inputs = {
  name = var.vpc_name
  cidr = var.cidr

  azs = ["us-west-2a", "us-west-2b"]
  public_subnets = ["10.0.0.0/26", "10.0.0.64/26", "10.0.0.128/26", "10.0.0.192/26"]

  create_igw = true
  enable_dns_hostnames = true
  enable_dns_support = true
}

include "root" {
  path = find_in_parent_folders()
}
