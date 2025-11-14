// MailerSend service types

export interface SendInvitationEmailParams {
	to: string;
	organizationName: string;
	ownerName: string;
	confirmationUrl: string;
}

export interface SendEmailResult {
	success: boolean;
	error?: string;
	messageId?: string;
}

export interface MailerSendEmailRequest {
	from: {
		email: string;
		name: string;
	};
	to: Array<{
		email: string;
		name?: string;
	}>;
	subject: string;
	text: string;
	html: string;
}

export interface MailerSendApiResponse {
	message?: string;
	errors?: Record<string, string[]>;
}
