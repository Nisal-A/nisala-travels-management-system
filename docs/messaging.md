# Messaging Channel Documentation

This document describes the messaging channel implementation and templates used for SMS and WhatsApp in the Nisala Travels Management System.

## Architecture

The system uses a unified `MessagingProvider` interface and a `MessagingChannel` Laravel notification channel.

Supported providers:
- `LogProvider` (default for local development, writes to laravel.log)
- `NullProvider` (does nothing, good for tests)
- `TwilioProvider` (Example real provider)

Switch providers via `.env`:
```
NOTIFICATIONS_SMS_ENABLED=true
MESSAGING_PROVIDER=log
```

## Phone Number Normalization
Sri Lankan numbers starting with `0` are automatically normalized to `+94` in the `MessagingChannel` before sending.

## WhatsApp Templates

If your provider (e.g., Twilio) requires pre-approved WhatsApp templates for initiating conversations, use the following templates.

### Payment Received Template
- **Name:** `payment_received`
- **Body:** `Payment of LKR {{1}} received for booking {{2}}. Thank you! View details at {{3}}`
- **Variables:**
  1. Amount
  2. Booking ID
  3. Portal Link

### Booking Confirmed Template
- **Name:** `booking_confirmed`
- **Body:** `Hi {{1}}, your booking {{2}} is confirmed! View your itinerary: {{3}}`
- **Variables:**
  1. Customer First Name
  2. Booking ID
  3. Portal Link

### Security Alert / Document Rejected
- **Name:** `document_rejected`
- **Body:** `Urgent: Action required for your booking {{1}}. Please log into the portal to review.`
- **Variables:**
  1. Booking ID

*Note: Never include sensitive data (like passport numbers) in SMS/WhatsApp messages.*
