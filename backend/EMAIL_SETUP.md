# Email Configuration Guide

To enable OTP emails, you need to configure email credentials in your `.env` file.

## For Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Shop4Ever Backend" as the name
   - Copy the 16-character password generated

3. **Add to your `.env` file**:
```env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## For Other Email Providers

### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Custom SMTP Server
```env
EMAIL_SERVICE=
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
```

## Testing

After configuring, restart your backend server. The email service will automatically test the configuration on startup.

If email sending fails, check:
1. Email credentials are correct
2. App Password is used (for Gmail)
3. Less secure app access is enabled (if required)
4. Firewall/network allows SMTP connections

## Development Mode

In development mode (`NODE_ENV=development`), if email sending fails, the OTP will be:
- Logged to console
- Returned in the API response (for testing)

**⚠️ Never use this in production!**



