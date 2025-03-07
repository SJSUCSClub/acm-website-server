import { env } from '@/env';
import { S3Client } from '@aws-sdk/client-s3';
import { AssumeRoleCommand, Credentials, GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

const region = 'us-west-2';
let credentials: Credentials | null = null;
const stsClient: STSClient = new STSClient({
    region, 
    credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
    },
});

const getCredentials = async (): Promise<Credentials | null> => {
    try {
        await stsClient.send(new GetCallerIdentityCommand());
    } catch {
        const input = new AssumeRoleCommand({
            RoleArn: 'arn:aws:iam::588738592350:role/AcmApplicationServerRoleForLocal',
            RoleSessionName: 'user_file_upload_session',
        });
        const response = await stsClient.send(input);
        if(response.Credentials === undefined) {
            credentials = null;
        } else {
            credentials = response.Credentials;
        }
    }
    return credentials;
}

export { getCredentials };