import { DeleteObjectCommand, PutObjectCommand, S3Client, S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-s3';
import type { Client } from '@smithy/types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getCredentials } from './iam';

// env
const BUCKET_NAME = 'acmwebsite-dev-588738592350-us-west-2';
const region = 'us-west-2';

let s3client: S3Client | null = null;

const getS3Client = async (): Promise<S3Client | null> => {
    const credentials = await getCredentials();
    if(credentials === null) {
        return null;
    } 
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
            // ReadableStream
            const uploadObjectCommand = new PutObjectCommand(
                {
                    Bucket: BUCKET_NAME,
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
            const deleteObjectCommand = new DeleteObjectCommand({Bucket: BUCKET_NAME, Key: key});
            await (<S3Client>s3client).send(deleteObjectCommand);
            return true;
        } catch {
            return false;
        }
    }
};

const getPresignedUrlPutObj = async (key: string): Promise<string | false> => {
    const s3client: S3Client | null = await getS3Client();
    if(s3client === null) { 
        return false;
    } else {
        try {
            const putObjectCommand = new PutObjectCommand(
                {
                    Bucket: BUCKET_NAME,
                    Key: key,
                });
            const url = await getSignedUrl(
                <Client<ServiceInputTypes, ServiceOutputTypes, S3ClientResolvedConfig>> s3client, 
                putObjectCommand, { expiresIn: 60 * 5 },
            );
            return url;
        } catch {
            return false;
        }
    }
};

export { uploadFile, deleteFile, getPresignedUrlPutObj };