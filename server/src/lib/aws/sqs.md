## Notification Service Documentation

### Template-Based Emails

Use this format when sending emails using pre-defined templates:

```typescript
await sendEmailNotification({
  recipient: ["user@example.com"], // Array of email(s)
  sender, // Load sender email from .env
  template_name: "welcome_email", // Must match a created template name in Amazon SES
  template_data: {
    // Data to populate template variables
    userName: "John Doe",
    activationLink: "https://example.com/activate",
    // Supports nested objects and arrays
  },
  application, // Load application type from .env
});
```

### Custom (Non-Template) Emails

Use this format for sending direct emails without templates:

```typescript
await sendEmailNotification({
  recipient: ["user@example.com"], // Array of email(s)
  sender, // Load sender email from .env
  subject: "Welcome to ACM", // Custom email subject
  body: "Your welcome message...", // Custom email body
  application, // Load application type from .env
});
```

### Important Notes

- `sender` email must be configured in your `.env` file
- `application` identifier must be configured in your `.env` file
- `recipient` accepts an array of email string(s)

### Creating Email Templates

#### API Endpoint
```http
POST /api/v1/email
Authorization: Required (Admin access only)
Content-Type: application/json
```

#### Request Body Structure
```json
{
    "name": "welcome_email",                    // Required: Template identifier
    "subject": "Welcome to {{organization}}!",  // Required: Email subject line
    "html": "<div>
        <h1>Welcome {{userName}}!</h1>
        <p>We're excited to have you join {{organization}}.</p>
        <p>Click <a href='{{activationLink}}'>here</a> to activate your account.</p>
        {{#if hasReferral}}
            <p>Thanks for joining through {{referralSource}}!</p>
        {{/if}}
    </div>",                                    // Required: HTML version
    "text": "Welcome {{userName}}!
        \n\nWe're excited to have you join {{organization}}.
        \n\nActivate your account here: {{activationLink}}
        {{#if hasReferral}}
        \n\nThanks for joining through {{referralSource}}!
        {{/if}}"                                // Required: Plain text version
}
```

#### Template Guidelines
1. **Variable Placeholders**
   - Basic syntax: `{{variableName}}`
   - Variables are case-sensitive
   - Common use cases:
     ```
     {{userName}}     // Single variable
     {{user.name}}    // Nested object access
     {{items.0.id}}   // Array access
     ```

2. **Supported Template Logic**
   - Conditional blocks:
     ```
     {{#if condition}}
         Content shown if condition is true
     {{else}}
         Optional else content
     {{/if}}
     ```
   - Loops:
     ```
     {{#each items}}
         <li>{{this.name}}: {{this.value}}</li>
     {{/each}}
     ```
   - Nested objects:
     ```
     {{#with user}}
         {{firstName}} {{lastName}}
     {{/with}}
     ```

3. **Best Practices**
   - Always provide both HTML and text versions
   - Use proper HTML structure in the HTML version
   - Ensure text version is properly formatted with newlines

#### Example Usage

```typescript
// First, create the template
await createEmailTemplate({
    name: "welcome_email",
    subject: "Welcome to {{organization}}!",
    html: "<h1>Hello {{userName}}</h1>...",
    text: "Hello {{userName}}..."
});

// Then use it in sendEmailNotification
await sendEmailNotification({
    recipient: ["user@example.com"],
    sender,
    template_name: "welcome_email",
    template_data: {
        organization: "ACM",
        userName: "John Doe",
        activationLink: "https://example.com/activate",
        hasReferral: true,
        referralSource: "Member Referral"
    },
    application
});
```