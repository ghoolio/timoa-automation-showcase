# API and Webhook Design

## External integrations

Timoa integrates or prepares integrations with:

- Stripe Checkout
- PayPal Checkout
- Resend email
- Supabase/Postgres
- Supabase Storage
- Vercel deployment

## Webhook use cases

### Stripe

- receive checkout/session/payment events
- match provider payment to internal payment
- update payment status
- keep appointment confirmation consistent

### PayPal

- receive payment capture events
- match provider order/capture to internal payment
- update payment status
- avoid duplicate fulfillment

## Design concerns

### Idempotency

Payment webhooks may be retried. Fulfillment should not create duplicate appointments or duplicate emails.

### Status mapping

External statuses need to map into internal states such as:

- pending
- paid
- failed
- cancelled
- manual_review

### Security

Webhook handling must avoid:

- trusting unsigned payloads
- logging secrets
- leaking raw provider payloads to the client
- exposing payment identifiers unnecessarily

### Monitoring

Important things to monitor:

- webhook delivery failures
- pending payments
- failed email sends
- duplicate email attempts
- appointment/payment state mismatch
