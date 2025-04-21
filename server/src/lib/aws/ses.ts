import { SESClient, TemplateMetadata, ListTemplatesCommand, Template, CreateTemplateCommand, GetTemplateCommand, UpdateTemplateCommand, DeleteTemplateCommand } from '@aws-sdk/client-ses';
import { getCredentials } from './iam';
import { env } from '@/env';

let sesClient: SESClient | null = null;

/**
 * Gets or creates an SES client using AWS credentials
 */
const getSESClient = async (): Promise<SESClient | null> => {
    if (sesClient) {
        return sesClient;
    }

    const credentials = await getCredentials();
    if (credentials === null) {
        return null;
    }

    const { REGION: region } = env;
    sesClient = new SESClient({region, credentials: {
        accessKeyId: <string>credentials.AccessKeyId,
        secretAccessKey: <string>credentials.SecretAccessKey,
        sessionToken: <string>credentials.SessionToken,
    }});
    return sesClient;
};

/**
 * Lists all email templates
 * @returns List of email templates
 * @throws {SESServiceException} When AWS SES service encounters an error
 */
export const listEmailTemplates = async () : Promise<TemplateMetadata[]> => {
    const sesClient = await getSESClient();
    if (sesClient === null) {
        throw new Error('SES client not found');
    }
    const command = new ListTemplatesCommand({});
    const response = await sesClient.send(command);
    return response.TemplatesMetadata || [];
};

/**
 * Creates a new email template
 * @param template The email template to create
 * @throws {AlreadyExistsException} When a template with the same name already exists
 * @throws {InvalidTemplateException} When the template could not be rendered
 * @throws {LimitExceededException} When service limits are exceeded
 * @throws {SESServiceException} When AWS SES service encounters an error
 */
export const createEmailTemplate = async (template: Template) : Promise<void> => {
    const sesClient = await getSESClient();
    if (sesClient === null) {
        throw new Error('SES client not found');
    }
    const command = new CreateTemplateCommand({
        Template: template,
    });
    await sesClient.send(command);
};

/**
 * Gets an email template by name
 * @param templateName The name of the email template to get
 * @returns The email template
 * @throws {TemplateDoesNotExistException} When the template does not exist
 * @throws {SESServiceException} When AWS SES service encounters an error
 */
export const getEmailTemplate = async (templateName: string): Promise<Template> => {
    const sesClient = await getSESClient();
    if (sesClient === null) {
        throw new Error('SES client not found');
    }
    const command = new GetTemplateCommand({
        TemplateName: templateName,
    });
    const response = await sesClient.send(command);
    if (!response.Template) {
        throw new Error('Template not found');
    }
    return response.Template;
};

/**
 * Updates an email template
 * @param template The email template to update
 * @throws {InvalidTemplateException} When the template could not be rendered
 * @throws {TemplateDoesNotExistException} When the template does not exist
 * @throws {SESServiceException} When AWS SES service encounters an error
 */
export const updateEmailTemplate = async (template: Template): Promise<void> => {
    const sesClient = await getSESClient();
    if (sesClient === null) {
        throw new Error('SES client not found');
    }
    const command = new UpdateTemplateCommand({
        Template: template,
    });
    await sesClient.send(command);
};

/**
 * Deletes an email template
 * @param templateName The name of the email template to delete
 * @throws {SESServiceException} When AWS SES service encounters an error
 */
export const deleteEmailTemplate = async (templateName: string): Promise<void> => {
    const sesClient = await getSESClient();
    if (sesClient === null) {
        throw new Error('SES client not found');
    }
    const command = new DeleteTemplateCommand({
        TemplateName: templateName,
    });
    await sesClient.send(command);
};
