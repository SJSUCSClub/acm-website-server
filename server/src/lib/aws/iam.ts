import { env } from '@/env';
import { AssumeRoleCommand, Credentials, STSClient } from '@aws-sdk/client-sts';

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
        const credentials = await stsClient.config.credentials();
        if (!credentials || !credentials.sessionToken) {
          throw new Error('No credentials found');
        }
    } catch {
        const {ROLE_ARN: role_arn} = env;
        const input = new AssumeRoleCommand({
            RoleArn: role_arn,
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
};

export { getCredentials };
