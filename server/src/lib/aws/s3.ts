import { DeleteObjectCommand, PutObjectCommand, S3Client, S3ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-s3';
import type { Client } from '@smithy/types';
import { getS3Client } from './iam';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET_NAME = 'acmwebsite-dev-588738592350-us-west-2';

const uploadFile = async (file: File): Promise<boolean> => {
    const s3client: S3Client | null = await getS3Client();
    if(s3client === null) {
        return false;
    } else {
        try {
            // ReadableStream
            const uploadObjectCommand = new PutObjectCommand(
                {
                    Bucket: BUCKET_NAME,
                    Key: file.name,
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
                putObjectCommand, { expiresIn: 30 },
            );
            return url;
        } catch {
            return false;
        }
    }
};

export { uploadFile, deleteFile, getPresignedUrlPutObj };