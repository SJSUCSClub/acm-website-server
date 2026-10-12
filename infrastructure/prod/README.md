# Prod infrastructure

Everything here is managed by Terraform (`terraform init && terraform apply`)
except the items under **Manual steps**.

| Resource | File |
|---|---|
| S3 media bucket | `media-storage/` |
| Server IAM role + IAM user | `iam.tf` |
| SQS notification queue + DLQ | `sqs.tf` |

## Manual steps

### 1. Terraform role (once, before the first `apply`)

Create the IAM role `AcmApplicationTerraformRoleForProdEnvironment`:

- **Trust policy:** the account itself (below). Who may actually assume the
  role is controlled by membership in the `TerraformProdAdmins` group
  (step 1a), so handing this over to new leads never touches the trust policy.
- **Permissions:** the policy below, as an inline policy.
- **Local profile:** add a profile with the same name to `~/.aws/config`:

  ```ini
  [profile AcmApplicationTerraformRoleForProdEnvironment]
  role_arn = arn:aws:iam::440744215929:role/AcmApplicationTerraformRoleForProdEnvironment
  source_profile = default
  region = us-west-2
  ```

Trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::440744215929:root" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Do **not** attach a broad `sts:*` / `AdministratorAccess` policy to the
application's runtime users (`acm-website-server*`). Because the role trusts
the account, any principal whose own policy allows `sts:AssumeRole` on it can
use it, so the app user must not be able to.

#### 1a. `TerraformProdAdmins` group (once)

IAM -> User groups -> Create group `TerraformProdAdmins`, then add an inline
policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::440744215929:role/AcmApplicationTerraformRoleForProdEnvironment"
    }
  ]
}
```

#### Handover checklist (every semester)

- Add the new leads' IAM users to `TerraformProdAdmins`.
- Remove outgoing leads from it.
- New leads add the `~/.aws/config` profile above and run
  `aws sts get-caller-identity --profile AcmApplicationTerraformRoleForProdEnvironment`
  to confirm access.

The role's permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StateBucketList",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::terraform-state-storage-440744215929-us-west-2"
    },
    {
      "Sid": "StateObjects",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::terraform-state-storage-440744215929-us-west-2/service/acm-website/prod/*"
    },
    {
      "Sid": "MediaBucket",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::acm-website-media-storage-prod-440744215929-us-west-2",
        "arn:aws:s3:::acm-website-media-storage-prod-440744215929-us-west-2/*"
      ]
    },
    {
      "Sid": "ServerIam",
      "Effect": "Allow",
      "Action": "iam:*",
      "Resource": [
        "arn:aws:iam::440744215929:role/AcmApplicationServerRoleForProdEnvironment",
        "arn:aws:iam::440744215929:user/acm-website-server-prod"
      ]
    },
    {
      "Sid": "NotificationQueues",
      "Effect": "Allow",
      "Action": "sqs:*",
      "Resource": "arn:aws:sqs:us-west-2:440744215929:acm-website-notifications-*prod"
    }
  ]
}
```

### 2. Server access key (once, after `apply`)

The access key is created by hand so the secret never ends up in state.

IAM -> Users -> `acm-website-server-prod` -> Security credentials -> Create
access key. Put it in `.env.prod` as `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY`.

### 3. SES

Verify the sender address / domain in SES (the value of `EMAIL_SENDER`), and
make sure the SES account is out of the sandbox for prod.

## Filling in `.env.prod`

After `apply`, `terraform output` prints:

| Output | `.env.prod` variable |
|---|---|
| `notification_service_queue_url` | `NOTIFICATION_SERVICE_QUEUE_URL` |
| `aws_role_arn` | `AWS_ROLE_ARN` |
| `s3_bucket_name` | `S3_BUCKET_NAME` |
| `server_user_name` | user to create the access key for |

The notification service that consumes the queue lives outside this repo. It
needs `sqs:ReceiveMessage` / `sqs:DeleteMessage` on `notification_service_queue_url`.
