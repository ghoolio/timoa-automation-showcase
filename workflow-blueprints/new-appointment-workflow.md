# Workflow Blueprint: New Appointment

## Purpose

Automate owner and customer notifications after a new appointment is created.

## Trigger

`appointment.created`

## Inputs

- appointmentId
- salonId
- serviceId
- appointment date/time
- payment method
- payment status

## Steps

1. Validate input.
2. Fetch appointment, salon and service.
3. Build customer confirmation email.
4. Build owner notification email.
5. Send emails.
6. Track safe analytics event.
7. Log result.

## Error handling

- If customer email fails, log failure and avoid crashing booking creation.
- If owner email fails, log failure and expose internal warning.
- Avoid duplicate emails through idempotency keys or sent markers.

## n8n node mapping

- Webhook Trigger
- Postgres/Supabase query
- IF node for payment method
- Code node for payload mapping
- Email/HTTP node for email provider
- Postgres/Supabase insert for log
