import { env } from "@/env";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, Credentials, GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

const region = 'us-west-2';

let s3credentials: Credentials | undefined;
let s3client: S3Client;
let stsClient: STSClient;
const BUCKET_NAME = 'acmwebsite-dev-588738592350-us-west-2';

const getRoleCredentials = async () : Promise<Credentials> => {
    try {
        if(!stsClient) {
            stsClient = new STSClient({region: region, credentials: {
                accessKeyId: env.ACCESS_KEY_ID,
                secretAccessKey: env.SECRET_ACCESS_KEY
            }});
        }
        const input = new AssumeRoleCommand({
            RoleArn: 'arn:aws:iam::588738592350:role/AcmApplicationServerRoleForLocal',
            RoleSessionName: 'user_file_upload_session'
        });
        const response = await stsClient.send(input);
        if(response.Credentials == undefined) {
            throw new Error("Error getting credentials");
        } else {
            return response.Credentials;
        }
    } catch (e) {
        throw new Error("Error getting credentials");
    }
}

let credentialsRefresh = async () => {
    try {
        await stsClient.send(new GetCallerIdentityCommand({}));
        if(!s3client) {
            s3credentials = await getRoleCredentials();
            s3client = new S3Client({region: region, credentials: {
                accessKeyId: <string> s3credentials.AccessKeyId,
                secretAccessKey: <string> s3credentials.SecretAccessKey,
                sessionToken: <string> s3credentials.SessionToken
            }});
        }
        return true;
    } catch {
        try {
            s3credentials = await getRoleCredentials();
            s3client = new S3Client({region: region, credentials: {
                accessKeyId: <string> s3credentials.AccessKeyId,
                secretAccessKey: <string> s3credentials.SecretAccessKey,
                sessionToken: <string> s3credentials.SessionToken
            }});
            return true;
        } catch {
            return false; // error refreshing credentials
        }
    }
}

const uploadFile = async (file: File): Promise<Boolean> => {
    try {
        await credentialsRefresh();
        const uploadObjectCommand = new PutObjectCommand({Bucket: BUCKET_NAME, Key: file.name, Body: (await file.arrayBuffer())});
        try {
            const repsonse = await s3client.send(uploadObjectCommand);
            return true;  
        } catch (e) {
            console.log(e);
            console.log('Error uploading to S3');
            return false;
        }
    } catch {
        return false;
    }
}

const deleteFile = async (fileKey: string): Promise<Boolean> => {
    try {
        await credentialsRefresh();
        const deleteObjectCommand = new DeleteObjectCommand({Bucket: BUCKET_NAME, Key: fileKey});
        try {
            const response = await s3client.send(deleteObjectCommand);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    } catch {
        return false;
    }
}

(async () => {
    try {
        s3credentials = await getRoleCredentials();
    } catch (e) {
        s3credentials = undefined;
    }
})()

export {uploadFile, deleteFile, credentialsRefresh, getRoleCredentials};