// ============================================================================
// Request Types
// ============================================================================

export interface SendInvitationEmailRequest {
	to: string;
	organizationName: string;
	ownerName: string;
	confirmationUrl: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface SendEmailResponse {
	success: boolean;
	error?: string;
	messageId?: string;
}

// ============================================================================
// Internal Types (not exported - MailerSend API-specific)
// ============================================================================

/**
 * MailerSend API email request structure.
 * Internal type used by sendEmail() function - not exposed to consumers.
 */
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

/**
 * MailerSend API response structure.
 * Internal type used for parsing API responses - not exposed to consumers.
 */
export interface MailerSendApiResponse {
	message?: string;
	errors?: Record<string, string[]>;
}
