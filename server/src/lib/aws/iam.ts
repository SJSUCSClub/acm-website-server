import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

const region = 'us-west-2';
let s3client: S3Client;
let stsClient: STSClient = new STSClient({
    region: region, 
    credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY
    }
});

const initializeS3client = async () => {
    try {
        const input = new AssumeRoleCommand({
            RoleArn: 'arn:aws:iam::588738592350:role/AcmApplicationServerRoleForLocal',
            RoleSessionName: 'user_file_upload_session'
        });
        const response = await stsClient.send(input);
        if(response.Credentials == undefined) {
            return false;
        } else {
            const credentials = response.Credentials;
            s3client = new S3Client({region: region, credentials: {
                accessKeyId: <string> credentials.AccessKeyId,
                secretAccessKey: <string> credentials.SecretAccessKey,
                sessionToken: <string> credentials.SessionToken
            }});
            return true;
        }
    } catch {
        return false;
    }
}

const getS3Client = async (): Promise<S3Client | Boolean> => {
    try {
        await stsClient.send(new GetCallerIdentityCommand());
        if(!s3client) {
            const intitialized = await initializeS3client();
            if(!intitialized) {
                return false;
            }
        }
        return s3client;
    } catch {
        const intitialized = await initializeS3client();
        if(!intitialized) {
            return false;
        }
        return s3client;
    }
}

export { getS3Client };