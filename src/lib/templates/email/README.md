# Email Templates

This directory contains email templates used by the application for transactional emails sent via MailerSend.

## Available Templates

### `invitation.html` & `invitation.txt`

Organization invitation email sent when an admin invites a new organization owner.

**Template Variables:**

- `{{organization_name}}` - Name of the organization the user is invited to
- `{{owner_name}}` - Full name of the person being invited
- `{{confirmation_url}}` - Complete setup URL with authentication token
- `{{site_url}}` - Base URL of the application (from SITE_URL env var)

**Usage:**

```typescript
import { readFileSync } from 'fs';
import { sendInvitationEmail } from '$lib/services/mailersend';

await sendInvitationEmail({
  to: 'user@example.com',
  organizationName: 'Pro Cycling League',
  ownerName: 'John Doe',
  confirmationUrl: 'https://yourapp.com/auth/complete-setup?token=...'
});
```

## Template Best Practices

### HTML Template (`invitation.html`)

1. **Responsive Design**: Uses media queries for mobile devices
2. **Inline Styles**: All styles are inline or in `<style>` tags for maximum email client compatibility
3. **Safe Fonts**: Uses system font stack for consistency across platforms
4. **Clear CTA**: Primary action button is prominent and centered
5. **Accessibility**: Good color contrast and readable font sizes
6. **Mobile-First**: Tested on common email clients (Gmail, Outlook, Apple Mail)

### Plain Text Template (`invitation.txt`)

1. **Fallback**: Automatically used when HTML rendering is unavailable
2. **Accessibility**: Screen reader friendly
3. **Deliverability**: Improves spam score when both HTML and text versions are provided
4. **Simple Formatting**: Uses ASCII characters and line breaks for structure

## Customization

### Changing Brand Colors

Replace the blue color (`#2563eb`) in `invitation.html` with your brand color:

```css
background-color: #2563eb; /* Header and button background */
color: #2563eb; /* Links and highlights */
```

### Adding Logo

Replace the emoji header `🚴 You're Invited!` with an image:

```html
<div class="header">
    <img src="https://yourcdn.com/logo.png" alt="Your Logo" style="max-width: 200px; height: auto;">
</div>
```

### Modifying Content

The templates use clear variable placeholders (`{{variable_name}}`). These are replaced by the `sendInvitationEmail()` function before sending.

## Testing

Before deploying changes:

1. **Preview**: Open `invitation.html` in a browser
2. **Replace Variables**: Temporarily substitute `{{variables}}` with test data
3. **Test Clients**: Use tools like Litmus or Email on Acid to test across email clients
4. **Spam Check**: Run through spam checkers to ensure deliverability
5. **Send Test**: Use MailerSend's test email feature

## MailerSend Integration

These templates are loaded by `src/lib/services/mailersend.ts` and sent via the MailerSend API.

**Configuration Required:**

```env
MAILERSEND_API_KEY=your_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Amateur Cycling Stats
```

## Future Templates

When adding new email templates:

1. Create both `.html` and `.txt` versions
2. Document all template variables in this README
3. Follow the same structure and styling
4. Add corresponding function in `mailersend.ts`
5. Test thoroughly before deploying

## Resources

- [MailerSend Documentation](https://developers.mailersend.com/)
- [Email Design Best Practices](https://www.campaignmonitor.com/dev-resources/guides/design/)
- [Email HTML Compatibility](https://www.caniemail.com/)
- [Litmus Email Testing](https://www.litmus.com/)
