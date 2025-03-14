output "media_storage_name" {
  description = "S3 media storage bucket name"
  value       = module.media_storage.s3_bucket_id
}
