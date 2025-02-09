include "root" {
  path = find_in_parent_folders()
}

inputs = {
  vpc_name = "acm-website-us-west-2"
  cidr = "10.0.0.0/24"

  azs = ["us-west-2a", "us-west-2b"]
  public_subnet_names = ["public-subnet-1-az-a", "public-subnet-2-az-a", "public-subnet-1-az-b", "public-subnet-2-az-b"]
  public_subnets = ["10.0.0.0/26", "10.0.0.64/26", "10.0.0.128/26", "10.0.0.192/26"]

  create_igw = true
  enable_dns_hostnames = true
  enable_dns_support = true

  security_groups = [
    name = "acm-website-server-sg",
    description = "server sg"
    ingress = [
      {
        from_port   = 5001
        to_port     = 5001
        protocol    = "tcp"
        description = "Open for all"
        cidr_blocks = "0.0.0.0/0"
      }
    ]
    egress = [
      {
        from_port   = "*"
        to_port     = "*"
        protocol    = "all"
        description = "Open for all"
        cidr_blocks = "0.0.0.0/0"
      }
    ],
    name = "acm-website-db-sg",
    description = "db sg"
    ingress = [
      {
        from_port   = 5432
        to_port     = 5432
        protocol    = "tcp"
        description = "Open for all"
        cidr_blocks = input.cidr
      }
    ]
    egress = [
      {
        from_port   = "*"
        to_port     = "*"
        protocol    = "all"
        description = "Open for all"
        cidr_blocks = "0.0.0.0/0"
      }
    ],
    name = "acm-website-efs-sg",
    description = "server sg"
    ingress = [
      {
        from_port   = 2049
        to_port     = 2049
        protocol    = "tcp"
        description = "Open for all"
        cidr_blocks = input.cidr
      }
    ]
    egress = []
  ]
}
