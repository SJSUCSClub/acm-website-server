import { DeleteObjectCommand, PutObjectCommand, S3Client, S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-s3';
import type { Client } from '@smithy/types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getCredentials } from './iam';
import { env } from '@/env';

let s3client: S3Client | null = null;

const getS3Client = async (): Promise<S3Client | null> => {
    const credentials = await getCredentials();
    if(credentials === null) {
        return null;
    } 
    const {REGION: region} = env;
    s3client = new S3Client({region, credentials: {
        accessKeyId: <string> credentials.AccessKeyId,
        secretAccessKey: <string> credentials.SecretAccessKey,
        sessionToken: <string> credentials.SessionToken,    
    }});
    return s3client;
};

const uploadFile = async (file: File, key: string): Promise<boolean> => {
    const s3client: S3Client | null = await getS3Client();
    if(s3client === null) {
        return false;
    } else {
        try {
            const {BUCKET_NAME: bucket_name} = env;
            // ReadableStream
            const uploadObjectCommand = new PutObjectCommand(
                {
                    Bucket: bucket_name,
                    Key: key,
                    Body: (new Buffer(await file.arrayBuffer())),
                });
            await (<S3Client>s3client).send(uploadObjectCommand);
            return true;
        } catch {
            return false;
        }
    }
};

const deleteFile = async (key: string): Promise<boolean> => {
    const s3client: S3Client | null = await getS3Client();
    if(s3client === null) {
        return false;
    } else {
        try {
            const {BUCKET_NAME: bucket_name} = env;
            const deleteObjectCommand = new DeleteObjectCommand({Bucket: bucket_name, Key: key});
            await (<S3Client>s3client).send(deleteObjectCommand);
            return true;
        } catch {
            return false;
        }
    }
};

const getPresignedUrlPutObj = async (key: string): Promise<string | null> => {
    const s3client: S3Client | null = await getS3Client();
    if(s3client === null) { 
        return null;
    } else {
        try {
            const {BUCKET_NAME: bucket_name} = env;
            const putObjectCommand = new PutObjectCommand(
                {
                    Bucket: bucket_name,
                    Key: key,
                });
            const url = await getSignedUrl(
                <Client<ServiceInputTypes, ServiceOutputTypes, S3ClientResolvedConfig>> s3client, 
                putObjectCommand, { expiresIn: 60 * 5 },
            );
            return url;
        } catch {
            return null;
        }
    }
};

export { uploadFile, deleteFile, getPresignedUrlPutObj };