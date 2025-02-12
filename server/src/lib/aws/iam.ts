import { env } from "@/env";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, Credentials, STSClient } from "@aws-sdk/client-sts";

const region = 'us-west-2';

let s3credentials: Credentials | undefined;
const BUCKET_NAME = 'us-west-2-global-terraform-state-backend';

const getRoleCredentials = async () : Promise<Credentials> => {
    const client = new STSClient({region: region, credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY
    }});
    const input = new AssumeRoleCommand({
        RoleArn: 'arn:aws:iam::588738592350:role/AcmApplicationServerRoleForLocal',
        RoleSessionName: 'user_file_upload_session'
    });
    const response = await client.send(input);
    if(response.Credentials == undefined) {
        throw new Error("Error getting credentials");
    } else {
        return <Credentials>response.Credentials;
    }
}

const uploadFile = async (credentials: any, bucketname: string, file: File): Promise<Boolean> => { 
    if(s3credentials) {
        const client = new S3Client({region: region, credentials: credentials});
        const uploadObjectCommand = new PutObjectCommand({Bucket: bucketname, Key: File.name, Body: file});
        try {
            const repsonse = await client.send(uploadObjectCommand);
            return true;
        } catch (e) {
            console.log('Error uploading to S3');
            console.log(e);
            return false;
        }
    } else {
        console.log('Credentials not yet created');
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

export {uploadFile};