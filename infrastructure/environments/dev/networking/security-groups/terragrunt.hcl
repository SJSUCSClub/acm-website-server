terraform {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.3.0"
}

inputs = {
  for_each = { for sg in var.security_groups : sg.name => sg }

  source      = "terraform-aws-modules/security-group/aws"
  name        = each.value.name
  description = each.value.description
  vpc_id      = module.vpc.vpc_id
  ingress_with_cidr_blocks = each.value.ingress_
  egress_with_cidr_blocks = each.value.egress
}

include "root" {
  path = find_in_parent_folders()
}
