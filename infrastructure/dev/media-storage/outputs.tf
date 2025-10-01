output "media_storage_name" {
  description = "S3 media storage bucket name"
  value       = module.acm_website_media_storage_dev_440744215929_us_west_2.s3_bucket_id
}
