import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getS3Client } from './iam';

const BUCKET_NAME = 'acmwebsite-dev-588738592350-us-west-2';

const uploadFile = async (file: File): Promise<boolean> => {
    const s3client: S3Client | boolean = await getS3Client();
    if(s3client === false) {
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
    const s3client: S3Client | boolean = await getS3Client();
    if(s3client === false) {
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

export { uploadFile, deleteFile };