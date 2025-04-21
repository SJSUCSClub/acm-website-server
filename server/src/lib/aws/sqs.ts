import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { getCredentials } from './iam';
import { env } from '@/env';

let sqsClient: SQSClient | null = null;

/**
 * Gets or creates an SQS client using AWS credentials
 */
const getSQSClient = async (): Promise<SQSClient | null> => {
    if (sqsClient) {
        return sqsClient;
    }

    const credentials = await getCredentials();
    if (credentials === null) {
        return null;
    }

    const { REGION: region } = env;
    sqsClient = new SQSClient({region, credentials: {
        accessKeyId: <string>credentials.AccessKeyId,
        secretAccessKey: <string>credentials.SecretAccessKey,
        sessionToken: <string>credentials.SessionToken,
    }});
    return sqsClient;
};

/**
 * Interface for email notification messages
 */
export interface EmailNotification {
    sender: string;
    recipient: string[];
    subject?: string;
    body?: string;
    template_name?: string;
    template_data?: {
        [key: string]: string | number | boolean | Array<Record<string, string | number | boolean>> | Record<string, string | number | boolean>;
    }
    application: string;   // application identifier e.g. 'acm-website', 'course-scheduler', etc...
}

/**
 * Sends a notification message to SQS for email delivery
 * @param notification The email notification data
 * @returns boolean indicating success or failure
 */
export const sendEmailNotification = async (notification: EmailNotification) : Promise<boolean> => {
    const sqsClient : SQSClient | null = await getSQSClient();
    if (sqsClient === null) {
        throw new Error('SQS client not found');
    } else {
        const { SQS_QUEUE_URL: queue_url } = env;

        const sendMessageCommand = new SendMessageCommand(
            {
                QueueUrl: queue_url,
                MessageBody: JSON.stringify(notification),
            });

        await (<SQSClient>sqsClient).send(sendMessageCommand);
        return true;
    }
};