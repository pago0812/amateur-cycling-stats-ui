/**
 * MailerSend Service
 *
 * Handles sending transactional emails via MailerSend API.
 * Uses HTML and plain text templates from src/lib/templates/email/
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { MAILERSEND_API_KEY, MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME } from '$env/static/private';
import { SITE_URL } from '$env/static/private';
import type {
	SendInvitationEmailParams,
	SendEmailResult,
	MailerSendEmailRequest,
	MailerSendApiResponse
} from '$lib/types/services';

const MAILERSEND_API_URL = 'https://api.mailersend.com/v1/email';
const TEMPLATES_PATH = join(process.cwd(), 'src/lib/templates/email');

/**
 * Validates that all required MailerSend environment variables are set
 */
function validateMailerSendConfig(): void {
	const missing: string[] = [];

	if (!MAILERSEND_API_KEY || MAILERSEND_API_KEY === 'your_mailersend_api_key_here') {
		missing.push('MAILERSEND_API_KEY');
	}
	if (!MAILERSEND_FROM_EMAIL || MAILERSEND_FROM_EMAIL === 'noreply@yourdomain.com') {
		missing.push('MAILERSEND_FROM_EMAIL');
	}
	if (!MAILERSEND_FROM_NAME) {
		missing.push('MAILERSEND_FROM_NAME');
	}

	if (missing.length > 0) {
		throw new Error(
			`MailerSend configuration incomplete. Missing or invalid: ${missing.join(', ')}`
		);
	}
}

/**
 * Loads an email template from the filesystem
 */
function loadTemplate(filename: string): string {
	try {
		const templatePath = join(TEMPLATES_PATH, filename);
		return readFileSync(templatePath, 'utf-8');
	} catch (error) {
		throw new Error(
			`Failed to load email template: ${filename}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Replaces template variables with actual values
 */
function replaceTemplateVariables(
	template: string,
	variables: Record<string, string>
): string {
	let result = template;

	for (const [key, value] of Object.entries(variables)) {
		const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
		result = result.replace(placeholder, value);
	}

	return result;
}

/**
 * Sends an email via MailerSend API
 */
async function sendEmail(request: MailerSendEmailRequest): Promise<SendEmailResult> {
	try {
		validateMailerSendConfig();

		const response = await fetch(MAILERSEND_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${MAILERSEND_API_KEY}`
			},
			body: JSON.stringify(request)
		});

		if (!response.ok) {
			const errorData: MailerSendApiResponse = await response.json().catch(() => ({}));
			const errorMessage =
				errorData.message || errorData.errors
					? JSON.stringify(errorData.errors)
					: `HTTP ${response.status}`;

			console.error('[MailerSend] API Error:', errorMessage);

			return {
				success: false,
				error: `Failed to send email: ${errorMessage}`
			};
		}

		// MailerSend returns 202 Accepted for successful email submissions
		const responseData = await response.json().catch(() => ({}));

		return {
			success: true,
			messageId: responseData.message_id || responseData.id
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[MailerSend] Error sending email:', errorMessage);

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Sends an organization invitation email
 *
 * @param params - Email parameters
 * @returns SendEmailResult with success status and optional error/messageId
 */
export async function sendInvitationEmail(
	params: SendInvitationEmailParams
): Promise<SendEmailResult> {
	try {
		// Load templates
		const htmlTemplate = loadTemplate('invitation.html');
		const textTemplate = loadTemplate('invitation.txt');

		// Prepare template variables
		const variables = {
			organization_name: params.organizationName,
			owner_name: params.ownerName,
			confirmation_url: params.confirmationUrl,
			site_url: SITE_URL
		};

		// Replace variables in templates
		const html = replaceTemplateVariables(htmlTemplate, variables);
		const text = replaceTemplateVariables(textTemplate, variables);

		// Prepare email request
		const emailRequest: MailerSendEmailRequest = {
			from: {
				email: MAILERSEND_FROM_EMAIL,
				name: MAILERSEND_FROM_NAME
			},
			to: [
				{
					email: params.to,
					name: params.ownerName
				}
			],
			subject: `You're invited to ${params.organizationName} - Amateur Cycling Stats`,
			text,
			html
		};

		// Send email
		const result = await sendEmail(emailRequest);

		if (result.success) {
			console.log(`[MailerSend] Invitation email sent to ${params.to}`);
		}

		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error('[MailerSend] Error preparing invitation email:', errorMessage);

		return {
			success: false,
			error: errorMessage
		};
	}
}
