import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "@aws-sdk/client-s3";
import type { Client } from "@smithy/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCredentials } from "./iam";
import { env } from "@/env";

let s3client: S3Client | null = null;

const getS3Client = async (): Promise<S3Client | null> => {
  const credentials = await getCredentials();
  if (credentials === null) {
    return null;
  }
  const { REGION: region } = env;
  s3client = new S3Client({
    region,
    credentials: {
      accessKeyId: <string>credentials.AccessKeyId,
      secretAccessKey: <string>credentials.SecretAccessKey,
      sessionToken: <string>credentials.SessionToken,
    },
  });
  return s3client;
};

const uploadFile = async (file: File, key: string): Promise<void> => {
  const s3client: S3Client | null = await getS3Client();
  if (s3client === null) {
    throw new Error("S3 client not found");
  } else {
    try {
      const { S3_BUCKET_NAME: bucket_name } = env;
      // ReadableStream
      const uploadObjectCommand = new PutObjectCommand({
        Bucket: bucket_name,
        Key: key,
        Body: new Buffer(await file.arrayBuffer()),
      });
      await (<S3Client>s3client).send(uploadObjectCommand);
    } catch {
      throw new Error("Failed to upload file");
    }
  }
};

const deleteFile = async (key: string): Promise<void> => {
  const s3client: S3Client | null = await getS3Client();
  if (s3client === null) {
    throw new Error("S3 client not found");
  } else {
    try {
      const { S3_BUCKET_NAME: bucket_name } = env;
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucket_name,
        Key: key,
      });
      await (<S3Client>s3client).send(deleteObjectCommand);
    } catch {
      throw new Error("Failed to delete file");
    }
  }
};

const getPresignedUrlPutObj = async (key: string): Promise<string> => {
  const s3client: S3Client | null = await getS3Client();
  if (s3client === null) {
    throw new Error("S3 client not found");
  } else {
    try {
      const { S3_BUCKET_NAME: bucket_name } = env;
      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket_name,
        Key: key,
      });
      const url = await getSignedUrl(
        <Client<ServiceInputTypes, ServiceOutputTypes, S3ClientResolvedConfig>>(
          s3client
        ),
        putObjectCommand,
        { expiresIn: 60 * 5 },
      );
      return url;
    } catch {
      throw new Error("Failed to generate presigned url");
    }
  }
};

const generateObjectUrl = (key: string | null): string => {
  if (key === null) {
    return `${env.S3_BUCKET_URL}${env.S3_DEFAULT_IMAGE_PLACEHOLDER}`;
  }
  return `${env.S3_BUCKET_URL}${key}`;
};

export { uploadFile, deleteFile, getPresignedUrlPutObj, generateObjectUrl };
